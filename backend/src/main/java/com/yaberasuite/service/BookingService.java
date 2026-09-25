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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private static final List<BookingStatus> HOLDING_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
    private final BookingRepository bookingRepository;
    private final BlockedDateRepository blockedDateRepository;
    private final OccupancyService occupancyService;
    private final EmailService emailService;

    public BookingService(
            BookingRepository bookingRepository,
            BlockedDateRepository blockedDateRepository,
            OccupancyService occupancyService,
            EmailService emailService
    ) {
        this.bookingRepository = bookingRepository;
        this.blockedDateRepository = blockedDateRepository;
        this.occupancyService = occupancyService;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse availability(LocalDate from, LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now();
        LocalDate end = to != null ? to : start.plusMonths(6);
        if (!end.isAfter(start)) {
            throw new ApiException("End date must be after start date.");
        }

        List<AvailabilityResponse.UnavailableRange> ranges = new ArrayList<>();
        bookingRepository.findOverlapping(start, end, HOLDING_STATUSES).forEach(booking -> ranges.add(
                new AvailabilityResponse.UnavailableRange(
                        booking.getCheckIn(),
                        booking.getCheckOut(),
                        booking.getStatus() == BookingStatus.PENDING ? "PENDING" : "BOOKED"
                )
        ));
        blockedDateRepository.findOverlapping(start, end).forEach(block -> ranges.add(
                new AvailabilityResponse.UnavailableRange(block.getStartDate(), block.getEndDate(), "BLOCKED")
        ));
        return new AvailabilityResponse(start, end, ranges);
    }

    @Transactional
    public BookingCreateResponse createRequest(BookingRequest request) {
        validateStay(request.checkIn(), request.checkOut(), request.numberOfGuests());

        bookingRepository.findOverlappingForUpdate(request.checkIn(), request.checkOut(), HOLDING_STATUSES);
        if (occupancyService.isRangeOccupied(request.checkIn(), request.checkOut())) {
            throw new DatesUnavailableException("Some of your selected dates are unavailable. Please choose another date.");
        }

        Booking booking = new Booking();
        booking.setBookingReference("YAB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setGuestName(request.guestName().trim());
        booking.setContactNumber(request.contactNumber().trim());
        booking.setEmail(request.email().trim());
        booking.setNumberOfGuests(request.numberOfGuests());
        booking.setCheckIn(request.checkIn());
        booking.setCheckOut(request.checkOut());
        booking.setMessage(request.message() == null || request.message().isBlank() ? null : request.message().trim());
        booking.setStatus(BookingStatus.PENDING);
        booking = bookingRepository.saveAndFlush(booking);

        try {
            occupancyService.occupyBooking(booking.getId(), booking.getCheckIn(), booking.getCheckOut());
        } catch (DataIntegrityViolationException ex) {
            throw new DatesUnavailableException("Some of your selected dates are unavailable. Please choose another date.");
        }

        // Notify guest — runs on a background thread, does not block the response
        emailService.sendBookingRequestReceived(booking);

        return new BookingCreateResponse(toResponse(booking), BookingStatus.PENDING);
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

        if (status == BookingStatus.CANCELLED) {
            occupancyService.releaseBooking(booking.getId());
            booking.setStatus(BookingStatus.CANCELLED);
        } else if (status == BookingStatus.CONFIRMED) {
            if (booking.getStatus() == BookingStatus.CANCELLED) {
                if (occupancyService.isRangeOccupied(booking.getCheckIn(), booking.getCheckOut())) {
                    throw new DatesUnavailableException("Those dates are no longer available.");
                }
                occupancyService.occupyBooking(booking.getId(), booking.getCheckIn(), booking.getCheckOut());
            }
            booking.setStatus(BookingStatus.CONFIRMED);
        } else if (status == BookingStatus.REJECTED) {
            occupancyService.releaseBooking(booking.getId());
            booking.setStatus(BookingStatus.REJECTED);
        } else if (status == BookingStatus.PENDING) {
            throw new ApiException("Bookings cannot be moved back to pending.");
        }

        Booking saved = bookingRepository.save(booking);

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
                booking.getMessage(),
                booking.getStatus(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}
