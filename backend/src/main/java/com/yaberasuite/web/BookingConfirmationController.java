package com.yaberasuite.web;

import com.yaberasuite.dto.BookingResponse;
import com.yaberasuite.service.BookingService;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BookingConfirmationController {

    private final BookingService bookingService;

    public BookingConfirmationController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PatchMapping("/api/bookings/{id}/confirm")
    public BookingResponse confirm(@PathVariable Long id) {
        return bookingService.confirm(id);
    }
}