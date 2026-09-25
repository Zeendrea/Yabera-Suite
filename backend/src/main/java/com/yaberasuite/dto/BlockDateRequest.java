package com.yaberasuite.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BlockDateRequest(
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        String reason
) {
}
