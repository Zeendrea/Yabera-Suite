package com.yaberasuite.dto;

import com.yaberasuite.domain.BookingStatus;

public record BookingCreateResponse(
        BookingResponse booking,
        BookingStatus status
) {
}
