package com.yaberasuite.dto;

import java.time.Instant;
import java.time.LocalDate;

public record BlockedDateResponse(
        Long id,
        LocalDate startDate,
        LocalDate endDate,
        String reason,
        Instant createdAt
) {
}
