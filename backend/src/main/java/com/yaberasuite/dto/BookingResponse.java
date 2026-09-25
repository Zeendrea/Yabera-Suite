package com.yaberasuite.dto;

import com.yaberasuite.domain.BookingStatus;

import java.time.Instant;
import java.time.LocalDate;

public record BookingResponse(
        Long id,
        String bookingReference,
        String guestName,
        String contactNumber,
        String email,
        Integer numberOfGuests,
        LocalDate checkIn,
        LocalDate checkOut,
        Integer nights,
        String message,
        BookingStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
