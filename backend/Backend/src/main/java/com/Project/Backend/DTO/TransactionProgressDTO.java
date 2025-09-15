package com.Project.Backend.DTO;

import java.time.LocalDateTime;

public class TransactionProgressDTO {
    private int transactionId;
    private int currentProgress;
    private String progressNote;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor for full progress data
    public TransactionProgressDTO(int transactionId, int currentProgress, String progressNote, 
                                String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.transactionId = transactionId;
        this.currentProgress = currentProgress;
        this.progressNote = progressNote;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Constructor for basic progress data (fallback)
    public TransactionProgressDTO(int transactionId, int currentProgress, String progressNote) {
        this.transactionId = transactionId;
        this.currentProgress = currentProgress;
        this.progressNote = progressNote;
        this.status = "UNKNOWN";
        this.createdAt = null;
        this.updatedAt = null;
    }

    // Getters and Setters
    public int getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(int transactionId) {
        this.transactionId = transactionId;
    }

    public int getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(int currentProgress) {
        this.currentProgress = currentProgress;
    }

    public String getProgressNote() {
        return progressNote;
    }

    public void setProgressNote(String progressNote) {
        this.progressNote = progressNote;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    @Override
    public String toString() {
        return "TransactionProgressDTO{" +
                "transactionId=" + transactionId +
                ", currentProgress=" + currentProgress +
                ", progressNote='" + progressNote + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
