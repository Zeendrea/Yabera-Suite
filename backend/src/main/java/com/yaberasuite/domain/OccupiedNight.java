package com.yaberasuite.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

@Entity
@Table(name = "occupied_nights", uniqueConstraints = {
        @UniqueConstraint(name = "uk_occupied_night_date", columnNames = "night_date")
})
public class OccupiedNight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "night_date", nullable = false, unique = true)
    private LocalDate nightDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OccupancySource source;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "blocked_date_id")
    private Long blockedDateId;

    public OccupiedNight() {
    }

    public OccupiedNight(LocalDate nightDate, OccupancySource source, Long bookingId, Long blockedDateId) {
        this.nightDate = nightDate;
        this.source = source;
        this.bookingId = bookingId;
        this.blockedDateId = blockedDateId;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getNightDate() {
        return nightDate;
    }

    public OccupancySource getSource() {
        return source;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public Long getBlockedDateId() {
        return blockedDateId;
    }
}
