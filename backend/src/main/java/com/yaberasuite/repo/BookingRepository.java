package com.yaberasuite.repo;

import com.yaberasuite.domain.Booking;
import com.yaberasuite.domain.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.status IN :statuses AND b.checkIn < :checkOut AND b.checkOut > :checkIn")
    List<Booking> findOverlappingForUpdate(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") List<BookingStatus> statuses
    );

    @Query("SELECT b FROM Booking b WHERE b.status IN :statuses AND b.checkIn < :to AND b.checkOut > :from")
    List<Booking> findOverlapping(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("statuses") List<BookingStatus> statuses
    );
}
