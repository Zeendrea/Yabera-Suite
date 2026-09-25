package com.yaberasuite.service;

import com.yaberasuite.domain.Booking;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class PricingService {

    private static final int WEEKDAY_RATE = 1999;
    private static final int WEEKEND_RATE = 2299;
    private static final int PROMO_RATE = 1799;
    private static final int EXTRA_GUEST_RATE = 300;

    public void applyTo(Booking booking) {
        int nights = Math.toIntExact(java.time.temporal.ChronoUnit.DAYS.between(
                booking.getCheckIn(), booking.getCheckOut()));
        int roomTotal;
        if (nights >= 3) {
            roomTotal = nights * PROMO_RATE;
        } else {
            roomTotal = 0;
            for (LocalDate date = booking.getCheckIn(); date.isBefore(booking.getCheckOut()); date = date.plusDays(1)) {
                boolean weekend = date.getDayOfWeek().getValue() >= 6;
                roomTotal += weekend ? WEEKEND_RATE : WEEKDAY_RATE;
            }
        }
        int extraGuestTotal = Math.max(0, booking.getNumberOfGuests() - 2) * EXTRA_GUEST_RATE * nights;
        booking.setRoomTotal(roomTotal);
        booking.setExtraGuestTotal(extraGuestTotal);
        booking.setTotalAmount(roomTotal + extraGuestTotal);
    }
}