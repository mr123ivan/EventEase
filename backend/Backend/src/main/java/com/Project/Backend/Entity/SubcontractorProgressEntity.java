package com.Project.Backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subcontractor_progress")
public class SubcontractorProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int subcontractorProgressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_progress_id", nullable = false)
    @JsonBackReference(value = "transaction-progress-subcontractor-progress")
    private TransactionProgressEntity transactionProgress;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subcontractor_id", nullable = false)
    private SubcontractorEntity subcontractor;

    @Column(nullable = false)
    private int progressPercentage; // 0-100 percentage

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckInStatus checkInStatus;

    @Column(columnDefinition = "TEXT")
    private String progressNotes;

    @Column(columnDefinition = "TEXT")
    private String progressImageUrl;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum CheckInStatus {
        PENDING,
        SUBMITTED_FOR_REVIEW,
        APPROVED,
        REJECTED
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.checkInStatus == null) {
            this.checkInStatus = CheckInStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public SubcontractorProgressEntity() {}

    public SubcontractorProgressEntity(TransactionProgressEntity transactionProgress, SubcontractorEntity subcontractor,
                                     int progressPercentage, String progressNotes) {
        this.transactionProgress = transactionProgress;
        this.subcontractor = subcontractor;
        this.progressPercentage = progressPercentage;
        this.progressNotes = progressNotes;
    }

    // Getters and Setters
    public int getSubcontractorProgressId() {
        return subcontractorProgressId;
    }

    public void setSubcontractorProgressId(int subcontractorProgressId) {
        this.subcontractorProgressId = subcontractorProgressId;
    }

    public TransactionProgressEntity getTransactionProgress() {
        return transactionProgress;
    }

    public void setTransactionProgress(TransactionProgressEntity transactionProgress) {
        this.transactionProgress = transactionProgress;
    }

    public SubcontractorEntity getSubcontractor() {
        return subcontractor;
    }

    public void setSubcontractor(SubcontractorEntity subcontractor) {
        this.subcontractor = subcontractor;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public CheckInStatus getCheckInStatus() {
        return checkInStatus;
    }

    public void setCheckInStatus(CheckInStatus checkInStatus) {
        this.checkInStatus = checkInStatus;
    }

    public String getProgressNotes() {
        return progressNotes;
    }

    public void setProgressNotes(String progressNotes) {
        this.progressNotes = progressNotes;
    }

    public String getProgressImageUrl() {
        return progressImageUrl;
    }

    public void setProgressImageUrl(String progressImageUrl) {
        this.progressImageUrl = progressImageUrl;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
