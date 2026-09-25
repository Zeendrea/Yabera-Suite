package com.yaberasuite.dto;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponse(
        LocalDate from,
        LocalDate to,
        List<UnavailableRange> unavailable
) {
    public record UnavailableRange(
            LocalDate start,
            LocalDate end,
            String type
    ) {
    }
}
