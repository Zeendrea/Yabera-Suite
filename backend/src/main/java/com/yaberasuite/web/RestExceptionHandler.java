package com.yaberasuite.web;

import com.yaberasuite.exception.ApiException;
import com.yaberasuite.exception.DatesUnavailableException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(DatesUnavailableException.class)
    public ResponseEntity<Map<String, String>> unavailable(DatesUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "code", "DATES_UNAVAILABLE",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler({ApiException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, String>> badRequest(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> conflict() {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "code", "DATES_UNAVAILABLE",
                "message", "Some of your selected dates are unavailable. Please choose another date."
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " is required")
                .orElse("Please complete all required fields.");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
