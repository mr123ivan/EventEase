package com.Project.Backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "transaction_progress")
public class TransactionProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int progressId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    @JsonBackReference(value = "transaction-progress")
    private TransactionsEntity transaction;

    @OneToMany(mappedBy = "transactionProgress", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "transaction-progress-subcontractor-progress")
    private List<SubcontractorProgressEntity> subcontractorProgresses;

    @Column(nullable = false)
    private int currentProgress; // 0-100 percentage

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status;

    @Column(columnDefinition = "TEXT")
    private String progressNote;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum ProgressStatus {
        INITIATED,      // 0% - Transaction created
        PAYMENT_RECEIVED, // 25% - Payment confirmed
        PLANNING,       // 50% - Event planning in progress
        PREPARATION,    // 75% - Event preparation
        COMPLETED       // 100% - Event completed
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.currentProgress == 0) {
            this.status = ProgressStatus.INITIATED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Auto-update status based on progress percentage
        if (this.currentProgress == 0) {
            this.status = ProgressStatus.INITIATED;
        } else if (this.currentProgress <= 25) {
            this.status = ProgressStatus.PAYMENT_RECEIVED;
        } else if (this.currentProgress <= 50) {
            this.status = ProgressStatus.PLANNING;
        } else if (this.currentProgress <= 75) {
            this.status = ProgressStatus.PREPARATION;
        } else if (this.currentProgress >= 100) {
            this.status = ProgressStatus.COMPLETED;
        }
    }

    // Constructors
    public TransactionProgressEntity() {}

    public TransactionProgressEntity(TransactionsEntity transaction, int currentProgress, String progressNote) {
        this.transaction = transaction;
        this.currentProgress = currentProgress;
        this.progressNote = progressNote;
    }

    // Getters and Setters
    public int getProgressId() {
        return progressId;
    }

    public void setProgressId(int progressId) {
        this.progressId = progressId;
    }

    public TransactionsEntity getTransaction() {
        return transaction;
    }

    public void setTransaction(TransactionsEntity transaction) {
        this.transaction = transaction;
    }

    public int getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(int currentProgress) {
        this.currentProgress = currentProgress;
    }

    public ProgressStatus getStatus() {
        return status;
    }

    public void setStatus(ProgressStatus status) {
        this.status = status;
    }

    public String getProgressNote() {
        return progressNote;
    }

    public void setProgressNote(String progressNote) {
        this.progressNote = progressNote;
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

    public List<SubcontractorProgressEntity> getSubcontractorProgresses() {
        return subcontractorProgresses;
    }

    public void setSubcontractorProgresses(List<SubcontractorProgressEntity> subcontractorProgresses) {
        this.subcontractorProgresses = subcontractorProgresses;
    }
}
