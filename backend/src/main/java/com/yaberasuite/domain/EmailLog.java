package com.yaberasuite.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "email_log")
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", nullable = false, length = 24)
    private String bookingReference;

    @Column(nullable = false, length = 160)
    private String recipient;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(name = "email_type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private EmailType emailType;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private EmailStatus status;

    /** Populated when status = FAILED — stores the exception message. */
    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    // ── Constructors ────────────────────────────────────────────────────────────

    public EmailLog() {}

    public EmailLog(String bookingReference, String recipient, String subject,
                    EmailType emailType, EmailStatus status) {
        this.bookingReference = bookingReference;
        this.recipient = recipient;
        this.subject = subject;
        this.emailType = emailType;
        this.status = status;
    }

    // ── Getters / Setters ────────────────────────────────────────────────────────

    public Long getId() { return id; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public EmailType getEmailType() { return emailType; }
    public void setEmailType(EmailType emailType) { this.emailType = emailType; }

    public EmailStatus getStatus() { return status; }
    public void setStatus(EmailStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
