package com.yaberasuite.repo;

import com.yaberasuite.domain.BookingStatus;

import java.time.LocalDate;

public interface BookingAvailabilityProjection {

    LocalDate getCheckIn();

    LocalDate getCheckOut();

    BookingStatus getStatus();
}