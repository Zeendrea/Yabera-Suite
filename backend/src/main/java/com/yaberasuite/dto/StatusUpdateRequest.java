package com.yaberasuite.dto;

import com.yaberasuite.domain.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StatusUpdateRequest(
	@NotNull BookingStatus status,
	@Size(max = 500) String reason
) {
}
