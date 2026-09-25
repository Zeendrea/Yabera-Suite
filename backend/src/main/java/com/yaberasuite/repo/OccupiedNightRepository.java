package com.yaberasuite.repo;

import com.yaberasuite.domain.OccupiedNight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface OccupiedNightRepository extends JpaRepository<OccupiedNight, Long> {

    boolean existsByNightDateIn(Collection<LocalDate> dates);

    List<OccupiedNight> findByNightDateBetween(LocalDate fromInclusive, LocalDate toInclusive);

    void deleteByBookingId(Long bookingId);

    void deleteByBlockedDateId(Long blockedDateId);
}
