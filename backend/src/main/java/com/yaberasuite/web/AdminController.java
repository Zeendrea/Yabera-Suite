package com.yaberasuite.web;

import com.yaberasuite.dto.BlockDateRequest;
import com.yaberasuite.dto.BlockedDateResponse;
import com.yaberasuite.dto.BookingResponse;
import com.yaberasuite.dto.StatusUpdateRequest;
import com.yaberasuite.service.BlockedDateService;
import com.yaberasuite.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BookingService bookingService;
    private final BlockedDateService blockedDateService;

    public AdminController(BookingService bookingService, BlockedDateService blockedDateService) {
        this.bookingService = bookingService;
        this.blockedDateService = blockedDateService;
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings() {
        return bookingService.listAll();
    }

    @PatchMapping("/bookings/{id}/status")
    public BookingResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return bookingService.updateStatus(id, request.status());
    }

    @GetMapping("/blocked-dates")
    public List<BlockedDateResponse> blockedDates() {
        return blockedDateService.list();
    }

    @PostMapping("/blocked-dates")
    @ResponseStatus(HttpStatus.CREATED)
    public BlockedDateResponse block(@Valid @RequestBody BlockDateRequest request) {
        return blockedDateService.block(request);
    }

    @DeleteMapping("/blocked-dates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unblock(@PathVariable Long id) {
        blockedDateService.unblock(id);
    }
}
