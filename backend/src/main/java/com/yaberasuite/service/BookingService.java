package com.yaberasuite.service;

import com.yaberasuite.domain.Booking;
import com.yaberasuite.domain.BookingStatus;
import com.yaberasuite.dto.AvailabilityResponse;
import com.yaberasuite.dto.BookingCreateResponse;
import com.yaberasuite.dto.BookingRequest;
import com.yaberasuite.dto.BookingResponse;
import com.yaberasuite.exception.ApiException;
import com.yaberasuite.exception.DatesUnavailableException;
import com.yaberasuite.repo.BlockedDateRepository;
import com.yaberasuite.repo.BookingRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StopWatch;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

        private static final List<BookingStatus> HOLDING_STATUSES = List.of(
            BookingStatus.AWAITING_PAYMENT,
            BookingStatus.PAYMENT_SUBMITTED,
            BookingStatus.PAYMENT_VERIFIED,
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED
        );
    private final BookingRepository bookingRepository;
    private final BlockedDateRepository blockedDateRepository;
    private final OccupancyService occupancyService;
    private final EmailService emailService;
    private final PricingService pricingService;

    public BookingService(
            BookingRepository bookingRepository,
            BlockedDateRepository blockedDateRepository,
            OccupancyService occupancyService,
            EmailService emailService,
            PricingService pricingService
    ) {
        this.bookingRepository = bookingRepository;
        this.blockedDateRepository = blockedDateRepository;
        this.occupancyService = occupancyService;
        this.emailService = emailService;
        this.pricingService = pricingService;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse availability(LocalDate from, LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now();
        LocalDate end = to != null ? to : start.plusMonths(6);
        if (!end.isAfter(start)) {
            throw new ApiException("End date must be after start date.");
        }

        List<AvailabilityResponse.UnavailableRange> ranges = new ArrayList<>();
        bookingRepository.findAvailabilityOverlapping(start, end, HOLDING_STATUSES).forEach(booking -> ranges.add(
                new AvailabilityResponse.UnavailableRange(
                        booking.getCheckIn(),
                        booking.getCheckOut(),
                        booking.getStatus() == BookingStatus.CONFIRMED ? "BOOKED" : "PENDING"
                )
        ));
        blockedDateRepository.findOverlapping(start, end).forEach(block -> ranges.add(
                new AvailabilityResponse.UnavailableRange(block.getStartDate(), block.getEndDate(), "BLOCKED")
        ));
        return new AvailabilityResponse(start, end, ranges);
    }

    @Transactional
    public BookingCreateResponse createRequest(BookingRequest request) {
        StopWatch sw = new StopWatch("booking-create");

        sw.start("validateStay");
        validateStay(request.checkIn(), request.checkOut(), request.numberOfGuests());
        sw.stop();

        sw.start("conflictCheck");
        Integer bookingConflict = bookingRepository.existsOverlap(
                request.checkIn(), request.checkOut(), HOLDING_STATUSES.stream().map(Enum::name).toList());
        if (bookingConflict != null) {
            throw new DatesUnavailableException("Some of your selected dates are unavailable. Please choose another date.");
        }
        sw.stop();

        sw.start("saveBooking");
        Booking booking = new Booking();
        booking.setBookingReference("YAB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setGuestName(request.guestName().trim());
        booking.setContactNumber(request.contactNumber().trim());
        booking.setEmail(request.email().trim());
        booking.setNumberOfGuests(request.numberOfGuests());
        booking.setCheckIn(request.checkIn());
        booking.setCheckOut(request.checkOut());
        booking.setMessage(request.message() == null || request.message().isBlank() ? null : request.message().trim());
        booking.setStatus(BookingStatus.AWAITING_PAYMENT);
        pricingService.applyTo(booking);
        booking = bookingRepository.saveAndFlush(booking);
        sw.stop();

        sw.start("occupyBooking");
        try {
            occupancyService.occupyBooking(booking.getId(), booking.getCheckIn(), booking.getCheckOut());
        } catch (DataIntegrityViolationException ex) {
            throw new DatesUnavailableException("Some of your selected dates are unavailable. Please choose another date.");
        }
        sw.stop();

        log.info(sw.prettyPrint());

        // Notify guest — runs on a background thread, does not block the response
        emailService.sendBookingRequestReceived(booking);

        return new BookingCreateResponse(toResponse(booking), BookingStatus.AWAITING_PAYMENT);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listAll() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public BookingResponse updateStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ApiException("Booking not found."));

        if (booking.getStatus() == status) {
            return toResponse(booking);
        }

        if (status == BookingStatus.REJECTED) {
            if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.EXPIRED) {
                throw new ApiException("This booking can no longer be rejected.");
            }
            occupancyService.releaseBooking(booking.getId());
            booking.setStatus(BookingStatus.REJECTED);
        } else if (status == BookingStatus.CANCELLED) {
            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                throw new ApiException("Only confirmed bookings can be cancelled.");
            }
            occupancyService.releaseBooking(booking.getId());
            booking.setStatus(BookingStatus.CANCELLED);
        } else if (status == BookingStatus.PAYMENT_SUBMITTED) {
            if (booking.getStatus() != BookingStatus.AWAITING_PAYMENT && booking.getStatus() != BookingStatus.PENDING) {
                throw new ApiException("Only bookings awaiting payment can be marked as payment submitted.");
            }
            booking.setStatus(BookingStatus.PAYMENT_SUBMITTED);
        } else if (status == BookingStatus.PAYMENT_VERIFIED) {
            if (booking.getStatus() != BookingStatus.PAYMENT_SUBMITTED) {
                throw new ApiException("Payment must be submitted before it can be verified.");
            }
            booking.setStatus(BookingStatus.PAYMENT_VERIFIED);
        } else if (status == BookingStatus.CONFIRMED) {
            if (booking.getStatus() != BookingStatus.PAYMENT_VERIFIED) {
                throw new ApiException("Payment must be verified before the booking can be confirmed.");
            }
            booking.setStatus(BookingStatus.CONFIRMED);
        } else if (status == BookingStatus.AWAITING_PAYMENT || status == BookingStatus.PENDING
                || status == BookingStatus.PAYMENT_VERIFIED || status == BookingStatus.EXPIRED) {
            throw new ApiException("Invalid booking status transition.");
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Booking {} status changed to {}", saved.getBookingReference(), saved.getStatus());

        // Notify guest of status change — runs on a background thread
        if (status == BookingStatus.CONFIRMED) {
            emailService.sendBookingConfirmed(saved);
        } else if (status == BookingStatus.REJECTED) {
            emailService.sendBookingRejected(saved);
        }

        return toResponse(saved);
    }

    private void validateStay(LocalDate checkIn, LocalDate checkOut, int guests) {
        LocalDate today = LocalDate.now();
        if (checkIn.isBefore(today)) {
            throw new ApiException("Past dates cannot be booked.");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new ApiException("Check-out must be after check-in.");
        }
        if (guests < 1 || guests > 4) {
            throw new ApiException("This studio can host 1 to 4 guests.");
        }
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getBookingReference(),
                booking.getGuestName(),
                booking.getContactNumber(),
                booking.getEmail(),
                booking.getNumberOfGuests(),
                booking.getCheckIn(),
                booking.getCheckOut(),
                booking.getNights(),
                booking.getRoomTotal(),
                booking.getExtraGuestTotal(),
                booking.getTotalAmount(),
                booking.getMessage(),
                booking.getStatus(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}
