package com.yaberasuite.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;

import java.time.LocalDate;

public record BookingRequest(
        @NotBlank @Size(max = 160) String guestName,
        @NotBlank @Size(max = 40) String contactNumber,
        @NotBlank @Email @Size(max = 160) String email,
        @NotNull @Min(1) @Max(4) Integer numberOfGuests,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @Size(max = 1000) String message
) {
}
