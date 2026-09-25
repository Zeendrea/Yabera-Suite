package com.yaberasuite.repo;

import com.yaberasuite.domain.BlockedDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BlockedDateRepository extends JpaRepository<BlockedDate, Long> {

    List<BlockedDate> findAllByOrderByStartDateAsc();

    @Query("SELECT b FROM BlockedDate b WHERE b.startDate <= :to AND b.endDate >= :from")
    List<BlockedDate> findOverlapping(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
