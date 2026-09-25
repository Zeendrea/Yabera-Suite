package com.yaberasuite.service;

import com.yaberasuite.domain.Booking;
import com.yaberasuite.domain.BookingStatus;
import com.yaberasuite.repo.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class BookingExpirationService {

    private static final Logger log = LoggerFactory.getLogger(BookingExpirationService.class);
    private final BookingRepository bookingRepository;
    private final OccupancyService occupancyService;

    public BookingExpirationService(BookingRepository bookingRepository, OccupancyService occupancyService) {
        this.bookingRepository = bookingRepository;
        this.occupancyService = occupancyService;
    }

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void expireUnpaidBookings() {
        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);
        bookingRepository.findByStatusAndCreatedAtBefore(BookingStatus.AWAITING_PAYMENT, cutoff)
                .forEach(this::expire);
    }

    private void expire(Booking booking) {
        try {
            occupancyService.releaseBooking(booking.getId());
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            log.info("Expired unpaid booking {} after 24 hours", booking.getBookingReference());
        } catch (RuntimeException ex) {
            log.error("Failed to expire booking {}", booking.getBookingReference(), ex);
        }
    }
}