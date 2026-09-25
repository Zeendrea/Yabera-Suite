package com.yaberasuite.repo;

import com.yaberasuite.domain.EmailLog;
import com.yaberasuite.domain.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    List<EmailLog> findByBookingReferenceOrderByCreatedAtDesc(String bookingReference);

    List<EmailLog> findByStatusOrderByCreatedAtDesc(EmailStatus status);
}
