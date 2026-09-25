package com.yaberasuite.web;

import com.yaberasuite.dto.AvailabilityResponse;
import com.yaberasuite.dto.BookingCreateResponse;
import com.yaberasuite.dto.BookingRequest;
import com.yaberasuite.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
public class GuestBookingController {

    private final BookingService bookingService;

    public GuestBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/api/availability")
    public AvailabilityResponse availability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return bookingService.availability(from, to);
    }

    @PostMapping("/api/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingCreateResponse create(@Valid @RequestBody BookingRequest request) {
        return bookingService.createRequest(request);
    }
}
