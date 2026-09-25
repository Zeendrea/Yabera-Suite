package com.yaberasuite.repo;

import com.yaberasuite.domain.OccupiedNight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface OccupiedNightRepository extends JpaRepository<OccupiedNight, Long> {

    @Query(value = "SELECT 1 FROM occupied_nights n WHERE n.night_date IN (:dates) LIMIT 1", nativeQuery = true)
    Integer existsAnyNightDateIn(@Param("dates") Collection<LocalDate> dates);

    boolean existsByNightDateIn(Collection<LocalDate> dates);

    List<OccupiedNight> findByNightDateBetween(LocalDate fromInclusive, LocalDate toInclusive);

    void deleteByBookingId(Long bookingId);

    void deleteByBlockedDateId(Long blockedDateId);
}
