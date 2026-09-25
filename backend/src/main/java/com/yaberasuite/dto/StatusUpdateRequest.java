package com.yaberasuite.dto;

import com.yaberasuite.domain.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull BookingStatus status) {
}
