package com.yaberasuite.service;

import com.yaberasuite.config.YaberaProperties;
import com.yaberasuite.domain.Booking;
import com.yaberasuite.domain.EmailLog;
import com.yaberasuite.domain.EmailStatus;
import com.yaberasuite.domain.EmailType;
import com.yaberasuite.repo.EmailLogRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

/**
 * Sends booking notification emails and records every attempt in email_log.
 *
 * <p>All send methods are {@code @Async} so they never block the HTTP request
 * thread. Status is recorded as PENDING → SENT or FAILED.
 *
 * <p>Payment flow: a {@code BOOKING_REQUEST_RECEIVED} email is the only email
 * type that carries the PSBank QR payment code (inline + attachment). Confirmed
 * and rejected emails never include payment collateral.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMMM d, yyyy");
    private static final int RATE_WEEKDAY = 1999;
    private static final int RATE_WEEKEND = 2299;
    private static final int RATE_DISCOUNT = 1799;
    private static final int EXTRA_GUEST_FEE = 300;

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;
    private final YaberaProperties props;

    public EmailService(JavaMailSender mailSender,
                        EmailLogRepository emailLogRepository,
                        YaberaProperties props) {
        this.mailSender = mailSender;
        this.emailLogRepository = emailLogRepository;
        this.props = props;
    }

    // ── Public trigger methods (called from BookingService) ─────────────────────

    @Async
    public void sendBookingRequestReceived(Booking booking) {
        String subject = "Booking Request Received";
        send(booking, subject, EmailType.BOOKING_REQUEST_RECEIVED,
                buildPendingHtml(booking));
    }

    @Async
    public void sendBookingConfirmed(Booking booking) {
      try {
        log.info("Preparing confirmation email for booking {}", booking.getBookingReference());
        String subject = "Booking Confirmed";
        send(booking, subject, EmailType.BOOKING_CONFIRMED,
            buildConfirmedHtml(booking));
      } catch (RuntimeException ex) {
        log.error("Could not prepare confirmation email for booking {}", booking.getBookingReference(), ex);
      }
    }

    @Async
    public void sendBookingRejected(Booking booking) {
        String subject = "Booking Request Update";
        send(booking, subject, EmailType.BOOKING_REJECTED,
                buildRejectedHtml(booking));
    }

    // ── Internal send + log ──────────────────────────────────────────────────────

    private void send(Booking booking, String subject, EmailType type, String html) {
        String to = booking.getEmail();
        String from = props.getMail().getFrom();

        // Record attempt as PENDING first
        EmailLog entry = new EmailLog(booking.getBookingReference(), to, subject, type, EmailStatus.PENDING);
        entry = emailLogRepository.save(entry);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true); // true = isHtml

            // Only booking-request emails carry the PSBank payment QR — never on
            // confirmation or rejection emails.
            if (type == EmailType.BOOKING_REQUEST_RECEIVED) {
                Resource qrResource = resolveQrCodeResource();
                if (qrResource != null) {
                    helper.addInline("qrpayment", qrResource, "image/jpeg");
                    helper.addAttachment("PSBank-QR-Payment.jpg", qrResource);
                  log.info("Attached payment QR for booking {} from {}", booking.getBookingReference(), qrResource.getDescription());
                } else {
                    log.warn("Booking request email for {} sent WITHOUT a QR code image — "
                            + "guest will not see a scannable payment option.",
                            booking.getBookingReference());
                }
            }

            mailSender.send(message);

            entry.setStatus(EmailStatus.SENT);
            log.info("Email [{}] sent to {} for booking {}", type, to, booking.getBookingReference());

        } catch (MessagingException | RuntimeException ex) {
            String errMsg = ex.getMessage();
            if (errMsg != null && errMsg.length() > 500) {
                errMsg = errMsg.substring(0, 500);
            }
            entry.setStatus(EmailStatus.FAILED);
            entry.setErrorMessage(errMsg);
            log.error("Email [{}] FAILED for booking {}: {}", type, booking.getBookingReference(), ex.getMessage());
        } finally {
            emailLogRepository.save(entry);
        }
    }

    // ── HTML template builders ───────────────────────────────────────────────────

    private String buildPendingHtml(Booking b) {
        String propertyName = props.getProperty().getName();
        PriceSummary price = computePriceSummary(b);
        String bookingRef = b.getBookingReference();
        String roomTotalText = formatPeso(price.roomTotal);
        String extraGuestFeeText = formatPeso(price.extraGuestTotal);
        String nightsText = price.nights + (price.nights == 1 ? " night" : " nights");
        String totalText = formatPeso(price.total);

        String qrMarkup = "<img src=\"cid:qrpayment\" alt=\"Payment QR code\" width=\"220\" style=\"display:block;width:220px;max-width:100%;height:auto;margin:0 auto 10px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:10px;\">";

        return wrap(propertyName, """
                <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0 0 12px">
                  Hello <strong>%s</strong>,
                </p>
                <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0 0 20px">
                  Thank you for your booking request. We have received your request for:
                </p>

                <table width="100%%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:separate;border-spacing:0;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
                  <tr>
                    <td style="padding:12px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb;width:50%%">
                      <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Check-in</span><br>
                      <span style="color:#1f2937;font-size:15px;font-weight:700">%s</span>
                    </td>
                    <td style="padding:12px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb">
                      <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Check-out</span><br>
                      <span style="color:#1f2937;font-size:15px;font-weight:700">%s</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:12px 16px;background:#fdf8f3;border-radius:0 0 10px 10px">
                      <span style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Guests</span><br>
                      <span style="color:#1f2937;font-size:15px;font-weight:700">%d</span>
                    </td>
                  </tr>
                </table>

                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin:0 0 24px;color:#9a3412">
                  <p style="margin:0;font-size:16px;line-height:1.6">Your booking is currently <strong>awaiting payment</strong>.</p>
                  <p style="margin:6px 0 0;font-size:14px;line-height:1.6">This request is not confirmed yet.</p>
                </div>

                <table width="100%%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:separate;border-spacing:0;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;background:#fffaf5">
                  <tr>
                    <td colspan="2" style="padding:14px 16px;background:#f3ede7;border-bottom:1px solid #e5e7eb">
                      <span style="color:#1f2937;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Payment Breakdown</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#4b5563;font-size:15px">Room rate</td>
                    <td style="padding:12px 16px;color:#1f2937;font-size:15px;font-weight:700;text-align:right">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#4b5563;font-size:15px;border-top:1px solid #f0e7df">Number of nights</td>
                    <td style="padding:12px 16px;color:#1f2937;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #f0e7df">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#4b5563;font-size:15px;border-top:1px solid #f0e7df">Extra guest fee</td>
                    <td style="padding:12px 16px;color:#1f2937;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #f0e7df">%s</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:16px;background:#fff;border-top:1px solid #e5e7eb">
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
                        <span style="color:#1f2937;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Total Amount to Pay</span>
                        <span style="color:#7c2d12;font-size:28px;font-weight:800;line-height:1.2;letter-spacing:.01em">%s</span>
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="background:#fff7f1;border:1px solid #f3d2bc;border-radius:12px;padding:20px 16px 18px;margin:0 0 24px;text-align:center">
                  <p style="margin:0 0 12px;color:#7c2d12;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Payment</p>
                  <p style="margin:0 0 14px;color:#4b5563;font-size:15px;line-height:1.6">Please scan the QR code below to complete your payment.</p>
                  %s
                </div>

                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:18px 16px;margin:0 0 24px">
                  <p style="margin:0 0 10px;color:#9a3412;font-size:16px;font-weight:700">Payment First Policy</p>
                  <p style="margin:0 0 10px;color:#7c2d12;font-size:15px;line-height:1.6"><strong>Payment must be completed within 24 hours after submitting your booking request.</strong></p>
                  <p style="margin:0 0 12px;color:#4b5563;font-size:15px;line-height:1.6">Your booking is not confirmed until payment has been verified by Yabera Suite.</p>
                  <p style="margin:0 0 8px;color:#1f2937;font-size:15px;font-weight:700">How to complete your payment:</p>
                  <ol style="margin:0;padding-left:20px;color:#4b5563;font-size:15px;line-height:1.8">
                    <li>Complete the payment using the QR code.</li>
                    <li>Take a screenshot of your payment receipt.</li>
                    <li>Reply to this email and attach the screenshot.</li>
                    <li>Wait for Yabera Suite to verify your payment.</li>
                  </ol>
                  <p style="margin:12px 0 0;color:#4b5563;font-size:15px;line-height:1.6">Once we verify your payment, we will send you a Booking Confirmation email.</p>
                </div>

                <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:16px;text-align:center">
                  <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px">Booking Reference</p>
                  <p style="color:#1f2937;font-size:22px;font-weight:800;letter-spacing:.08em;margin:0">%s</p>
                </div>

                <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0">
                  We will send you a confirmation as soon as your payment has been verified.
                </p>
                """.formatted(
                b.getGuestName(),
                b.getCheckIn().format(DATE_FMT),
                b.getCheckOut().format(DATE_FMT),
                b.getNumberOfGuests(),
                roomTotalText,
                nightsText,
                extraGuestFeeText,
                totalText,
                qrMarkup,
                bookingRef
        ));
    }

    private Resource resolveQrCodeResource() {
            String configuredPath = props.getMail().getQrPath();
            if (configuredPath != null && !configuredPath.isBlank()) {
                  Resource configured = configuredPath.startsWith("classpath:")
                  ? new ClassPathResource(configuredPath.substring("classpath:".length()))
                  : new FileSystemResource(Path.of(configuredPath).toAbsolutePath().normalize());
              if (configured.exists() && configured.isReadable()) {
                return configured;
              }
              log.error("Configured payment QR image is missing or unreadable: {}", configuredPath);
            }

        Resource bundledResource = new ClassPathResource("static/images/QR-Payment.jpg");
        if (bundledResource.exists() && bundledResource.isReadable()) {
            return bundledResource;
        }

        Path frontendPath = Path.of("..", "frontend", "public", "images", "QR-Payment.jpg")
                .toAbsolutePath()
                .normalize();
        Resource frontendResource = new FileSystemResource(frontendPath);
        if (frontendResource.exists() && frontendResource.isReadable()) {
            return frontendResource;
        }

        log.error("Payment QR image not found. Checked configured path, classpath resource "
                + "static/images/QR-Payment.jpg and filesystem path {}", frontendPath);
        return null;
    }

    private PriceSummary computePriceSummary(Booking booking) {
      if (booking.getRoomTotal() != null && booking.getExtraGuestTotal() != null && booking.getTotalAmount() != null) {
        int nights = Math.toIntExact(ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut()));
        return new PriceSummary(nights, booking.getRoomTotal(), booking.getExtraGuestTotal(), booking.getTotalAmount());
      }
        int nights = Math.toIntExact(ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut()));
        int extraGuests = Math.max(0, booking.getNumberOfGuests() - 2);
        boolean discountApplied = nights >= 3;

        int roomTotal;
        if (discountApplied) {
            roomTotal = nights * RATE_DISCOUNT;
        } else {
            int weekdayNights = 0;
            int weekendNights = 0;
            LocalDate cursor = booking.getCheckIn();
            while (cursor.isBefore(booking.getCheckOut())) {
                int dayOfWeek = cursor.getDayOfWeek().getValue();
                if (dayOfWeek == 6 || dayOfWeek == 7) {
                    weekendNights++;
                } else {
                    weekdayNights++;
                }
                cursor = cursor.plusDays(1);
            }
            roomTotal = (weekdayNights * RATE_WEEKDAY) + (weekendNights * RATE_WEEKEND);
        }

        int extraGuestTotal = extraGuests * EXTRA_GUEST_FEE * nights;
        return new PriceSummary(nights, roomTotal, extraGuestTotal, roomTotal + extraGuestTotal);
    }

    private String formatPeso(int amount) {
        return "₱" + NumberFormat.getNumberInstance(Locale.US).format(amount);
    }

    private static class PriceSummary {
      private final int nights;
        private final int roomTotal;
        private final int extraGuestTotal;
        private final int total;

        private PriceSummary(int nights, int roomTotal, int extraGuestTotal, int total) {
          this.nights = nights;
            this.roomTotal = roomTotal;
            this.extraGuestTotal = extraGuestTotal;
            this.total = total;
        }
    }

    private String buildConfirmedHtml(Booking b) {
        String propertyName = props.getProperty().getName();
        String hostEmail    = props.getMail().getFrom();
        int nights = b.getNights() != null ? b.getNights() : 0;

        return wrap(propertyName, """
                <!-- Greeting -->
                <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0 0 8px">
                  Hello <strong>%s</strong>,
                </p>
                <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0 0 28px">
                  Great news — your booking has been <strong style="color:#16a34a">confirmed</strong>!
                  We look forward to welcoming you to <strong>%s</strong>.
                </p>

                <!-- ── Booking Details ── -->
                <p style="color:#1f2937;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin:0 0 10px">Booking Details</p>
                <table width="100%%" cellpadding="0" cellspacing="0"
                       style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
                  <tr>
                    <td style="padding:12px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb;width:45%%">
                      <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Booking Reference</span><br>
                      <span style="color:#1f2937;font-size:18px;font-weight:700;letter-spacing:.07em">%s</span>
                    </td>
                    <td style="padding:12px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb">
                      <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Guests</span><br>
                      <span style="color:#1f2937;font-size:16px;font-weight:600">%d guest%s</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb">
                      <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Check-in</span><br>
                      <span style="color:#1f2937;font-size:16px;font-weight:600">%s</span>
                    </td>
                    <td style="padding:12px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb">
                      <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Check-out</span><br>
                      <span style="color:#1f2937;font-size:16px;font-weight:600">%s</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:12px 16px;background:#fdf8f3">
                      <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Duration</span><br>
                      <span style="color:#1f2937;font-size:16px;font-weight:600">%d night%s</span>
                    </td>
                  </tr>
                </table>

                <!-- ── Property Details ── -->
                <p style="color:#1f2937;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin:0 0 10px">Property</p>
                <table width="100%%" cellpadding="0" cellspacing="0"
                       style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
                  <tr>
                    <td style="padding:12px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb">
                      <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Name</span><br>
                      <span style="color:#1f2937;font-size:15px;font-weight:600">%s</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;background:#fdf8f3">
                      <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Address</span><br>
                      <span style="color:#1f2937;font-size:15px;font-weight:600">Avida Towers Riala Tower 5 | Room 3025</span><br>
                      <span style="color:#4b5563;font-size:14px">Cebu IT Park, Jose Maria del Mar Street, Apas, Cebu City</span>
                    </td>
                  </tr>
                </table>

                <!-- ── Check-in Reminders ── -->
                <p style="color:#1f2937;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin:0 0 10px">Good to Know</p>
                <table width="100%%" cellpadding="0" cellspacing="0"
                       style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
                  <tr>
                    <td style="padding:10px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb">
                      <span style="font-size:15px">🕒</span>
                      <span style="color:#4b5563;font-size:14px;margin-left:8px">
                        <strong style="color:#1f2937">Check-in:</strong> 3:00 PM &nbsp;·&nbsp;
                        <strong style="color:#1f2937">Check-out:</strong> 12:00 PM
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb">
                      <span style="font-size:15px">🏊</span>
                      <span style="color:#4b5563;font-size:14px;margin-left:8px">
                        <strong style="color:#1f2937">Pool hours:</strong> 6:00 AM – 10:00 PM
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 16px;background:#fdf8f3;border-bottom:1px solid #e5e7eb">
                      <span style="font-size:15px">🪪</span>
                      <span style="color:#4b5563;font-size:14px;margin-left:8px">
                        Please bring a valid <strong style="color:#1f2937">government-issued ID</strong> for
                        building registration upon arrival.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 16px;background:#fdf8f3">
                      <span style="font-size:15px">✉️</span>
                      <span style="color:#4b5563;font-size:14px;margin-left:8px">
                        Questions? Email us at
                        <a href="mailto:%s" style="color:#1f2937;font-weight:600;text-decoration:underline">%s</a>
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0">
                  Thank you for choosing <strong>%s</strong>. See you soon!<br>
                  <span style="color:#9ca3af;font-size:13px">— The %s Team</span>
                </p>
                """.formatted(
                b.getGuestName(),
                propertyName,
                b.getBookingReference(),
                b.getNumberOfGuests(), b.getNumberOfGuests() == 1 ? "" : "s",
                b.getCheckIn().format(DATE_FMT),
                b.getCheckOut().format(DATE_FMT),
                nights, nights == 1 ? "" : "s",
                propertyName,
                hostEmail, hostEmail,
                propertyName,
                propertyName
        ));
    }

    private String buildRejectedHtml(Booking b) {
        String propertyName = props.getProperty().getName();
        return wrap(propertyName, """
                <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0 0 16px">
                  Hello <strong>%s</strong>,
                </p>
                <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0 0 16px">
                  Thank you for your interest in staying with us.
                </p>
                <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0 0 24px">
                  Unfortunately, the selected dates are <strong>unavailable</strong>.
                  Please visit our website to choose other available dates.
                </p>

                <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center">
                  <p style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px">Booking Reference</p>
                  <p style="color:#1f2937;font-size:22px;font-weight:700;letter-spacing:.08em;margin:0">%s</p>
                </div>

                <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0">
                  Thank you.
                </p>
                """.formatted(
                b.getGuestName(),
                b.getBookingReference()
        ));
    }

    // ── Shared wrapper (header, footer, mobile-friendly layout) ─────────────────

    private String wrap(String propertyName, String bodyContent) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width,initial-scale=1">
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 16px">
                    <tr>
                      <td align="center">
                        <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px">

                          <!-- Header -->
                          <tr>
                            <td style="background:#1c1917;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">
                              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:.04em">%s</p>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
                              %s
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#f3f4f6;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;padding:20px 32px;text-align:center">
                              <p style="margin:0;color:#9ca3af;font-size:13px">
                                This is an automated message from <strong>%s</strong>.<br>
                                Reply to this email with your payment receipt or any booking questions.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(propertyName, propertyName, bodyContent, propertyName);
    }
}