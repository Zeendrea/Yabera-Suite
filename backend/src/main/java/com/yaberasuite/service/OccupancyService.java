package com.yaberasuite.service;

import com.yaberasuite.domain.OccupancySource;
import com.yaberasuite.domain.OccupiedNight;
import com.yaberasuite.repo.OccupiedNightRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class OccupancyService {

    private final OccupiedNightRepository occupiedNightRepository;

    public OccupancyService(OccupiedNightRepository occupiedNightRepository) {
        this.occupiedNightRepository = occupiedNightRepository;
    }

    public List<LocalDate> nights(LocalDate checkIn, LocalDate checkOut) {
        List<LocalDate> dates = new ArrayList<>();
        for (LocalDate date = checkIn; date.isBefore(checkOut); date = date.plusDays(1)) {
            dates.add(date);
        }
        return dates;
    }

    public List<LocalDate> nightsInclusive(LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            dates.add(date);
        }
        return dates;
    }

    public boolean isRangeOccupied(LocalDate checkIn, LocalDate checkOut) {
        return occupiedNightRepository.existsByNightDateIn(nights(checkIn, checkOut));
    }

    public boolean isRangeOccupiedInclusive(LocalDate startDate, LocalDate endDate) {
        return occupiedNightRepository.existsByNightDateIn(nightsInclusive(startDate, endDate));
    }

    public void occupyBooking(Long bookingId, LocalDate checkIn, LocalDate checkOut) {
        occupy(nights(checkIn, checkOut), OccupancySource.BOOKING, bookingId, null);
    }

    public void occupyBlock(Long blockedDateId, LocalDate startDate, LocalDate endDate) {
        occupy(nightsInclusive(startDate, endDate), OccupancySource.BLOCK, null, blockedDateId);
    }

    public void releaseBooking(Long bookingId) {
        occupiedNightRepository.deleteByBookingId(bookingId);
    }

    public void releaseBlock(Long blockedDateId) {
        occupiedNightRepository.deleteByBlockedDateId(blockedDateId);
    }

    private void occupy(List<LocalDate> nights, OccupancySource source, Long bookingId, Long blockedDateId) {
        if (nights.isEmpty()) {
            throw new IllegalArgumentException("Stay must include at least one night.");
        }
        if (occupiedNightRepository.existsByNightDateIn(nights)) {
            throw new DataIntegrityViolationException("Dates already occupied");
        }
        List<OccupiedNight> rows = nights.stream()
                .map(night -> new OccupiedNight(night, source, bookingId, blockedDateId))
                .toList();
        occupiedNightRepository.saveAll(rows);
        occupiedNightRepository.flush();
    }

}
