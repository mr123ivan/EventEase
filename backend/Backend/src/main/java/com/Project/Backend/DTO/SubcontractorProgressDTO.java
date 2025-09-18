package com.Project.Backend.DTO;

import java.time.LocalDateTime;

public class SubcontractorProgressDTO {
    private int subcontractorProgressId;
    private int transactionId;
    private int subcontractorId;
    private int userId;
    private String subcontractorName;
    private String subcontractorRole;
    private String serviceName;
    private String subcontractorAvatar;
    private int progressPercentage;
    private String checkInStatus;
    private String progressNotes;
    private String progressImageUrl;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String eventName;
    private String clientName;
    private String userName;
    private String transactionVenue;
    private String transactionStatus;
    private String transactionDate;

    // Constructor for full subcontractor progress data
    public SubcontractorProgressDTO(int subcontractorProgressId, int transactionId, int subcontractorId,
                                  String subcontractorName, String subcontractorRole, String subcontractorAvatar,
                                  int progressPercentage, String checkInStatus, String progressNotes, String comment,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.subcontractorProgressId = subcontractorProgressId;
        this.transactionId = transactionId;
        this.subcontractorId = subcontractorId;
        this.subcontractorName = subcontractorName;
        this.subcontractorRole = subcontractorRole;
        this.subcontractorAvatar = subcontractorAvatar;
        this.progressPercentage = progressPercentage;
        this.checkInStatus = checkInStatus;
        this.progressNotes = progressNotes;
        this.comment = comment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Constructor for full subcontractor progress data with image URL
    public SubcontractorProgressDTO(int subcontractorProgressId, int transactionId, int subcontractorId,
                                  String subcontractorName, String subcontractorRole, String subcontractorAvatar,
                                  int progressPercentage, String checkInStatus, String progressNotes, String progressImageUrl, String comment,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.subcontractorProgressId = subcontractorProgressId;
        this.transactionId = transactionId;
        this.subcontractorId = subcontractorId;
        this.subcontractorName = subcontractorName;
        this.subcontractorRole = subcontractorRole;
        this.subcontractorAvatar = subcontractorAvatar;
        this.progressPercentage = progressPercentage;
        this.checkInStatus = checkInStatus;
        this.progressNotes = progressNotes;
        this.progressImageUrl = progressImageUrl;
        this.comment = comment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Constructor for full subcontractor progress data with userId and image URL
    public SubcontractorProgressDTO(int subcontractorProgressId, int transactionId, int subcontractorId, int userId,
                                  String subcontractorName, String subcontractorRole, String serviceName, String subcontractorAvatar,
                                  int progressPercentage, String checkInStatus, String progressNotes, String progressImageUrl, String comment,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.subcontractorProgressId = subcontractorProgressId;
        this.transactionId = transactionId;
        this.subcontractorId = subcontractorId;
        this.userId = userId;
        this.subcontractorName = subcontractorName;
        this.subcontractorRole = subcontractorRole;
        this.serviceName = serviceName;
        this.subcontractorAvatar = subcontractorAvatar;
        this.progressPercentage = progressPercentage;
        this.checkInStatus = checkInStatus;
        this.progressNotes = progressNotes;
        this.progressImageUrl = progressImageUrl;
        this.comment = comment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Constructor for full subcontractor progress data with all fields
    public SubcontractorProgressDTO(int subcontractorProgressId, int transactionId, int subcontractorId, int userId,
                                  String subcontractorName, String subcontractorRole, String serviceName, String subcontractorAvatar,
                                  int progressPercentage, String checkInStatus, String progressNotes, String progressImageUrl, String comment,
                                  LocalDateTime createdAt, LocalDateTime updatedAt, String eventName, String clientName,
                                  String transactionVenue, String transactionStatus, String transactionDate) {
        this.subcontractorProgressId = subcontractorProgressId;
        this.transactionId = transactionId;
        this.subcontractorId = subcontractorId;
        this.userId = userId;
        this.subcontractorName = subcontractorName;
        this.subcontractorRole = subcontractorRole;
        this.serviceName = serviceName;
        this.subcontractorAvatar = subcontractorAvatar;
        this.progressPercentage = progressPercentage;
        this.checkInStatus = checkInStatus;
        this.progressNotes = progressNotes;
        this.progressImageUrl = progressImageUrl;
        this.comment = comment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.eventName = eventName;
        this.clientName = clientName;
        this.transactionVenue = transactionVenue;
        this.transactionStatus = transactionStatus;
        this.transactionDate = transactionDate;
    }

    // Constructor for basic subcontractor progress data
    public SubcontractorProgressDTO(int subcontractorId, String subcontractorName, String subcontractorRole,
                                  String subcontractorAvatar, int progressPercentage, String checkInStatus,
                                  String progressNotes, String comment) {
        this.subcontractorId = subcontractorId;
        this.subcontractorName = subcontractorName;
        this.subcontractorRole = subcontractorRole;
        this.subcontractorAvatar = subcontractorAvatar;
        this.progressPercentage = progressPercentage;
        this.checkInStatus = checkInStatus;
        this.progressNotes = progressNotes;
        this.comment = comment;
    }

    // Getters and Setters
    public int getSubcontractorProgressId() {
        return subcontractorProgressId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public void setSubcontractorProgressId(int subcontractorProgressId) {
        this.subcontractorProgressId = subcontractorProgressId;
    }

    public int getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(int transactionId) {
        this.transactionId = transactionId;
    }

    public int getSubcontractorId() {
        return subcontractorId;
    }

    public void setSubcontractorId(int subcontractorId) {
        this.subcontractorId = subcontractorId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getSubcontractorName() {
        return subcontractorName;
    }

    public void setSubcontractorName(String subcontractorName) {
        this.subcontractorName = subcontractorName;
    }

    public String getSubcontractorRole() {
        return subcontractorRole;
    }

    public void setSubcontractorRole(String subcontractorRole) {
        this.subcontractorRole = subcontractorRole;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getSubcontractorAvatar() {
        return subcontractorAvatar;
    }

    public void setSubcontractorAvatar(String subcontractorAvatar) {
        this.subcontractorAvatar = subcontractorAvatar;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getCheckInStatus() {
        return checkInStatus;
    }

    public void setCheckInStatus(String checkInStatus) {
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

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getTransactionVenue() {
        return transactionVenue;
    }

    public void setTransactionVenue(String transactionVenue) {
        this.transactionVenue = transactionVenue;
    }

    public String getTransactionStatus() {
        return transactionStatus;
    }

    public void setTransactionStatus(String transactionStatus) {
        this.transactionStatus = transactionStatus;
    }

    public String getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }

    @Override
    public String toString() {
        return "SubcontractorProgressDTO{" +
                "subcontractorProgressId=" + subcontractorProgressId +
                ", transactionId=" + transactionId +
                ", subcontractorId=" + subcontractorId +
                ", subcontractorName='" + subcontractorName + '\'' +
                ", subcontractorRole='" + subcontractorRole + '\'' +
                ", progressPercentage=" + progressPercentage +
                ", checkInStatus='" + checkInStatus + '\'' +
                ", progressNotes='" + progressNotes + '\'' +
                ", updatedAt=" + updatedAt +
                ", eventName='" + eventName + '\'' +
                ", clientName='" + clientName + '\'' +
                ", transactionVenue='" + transactionVenue + '\'' +
                ", transactionStatus='" + transactionStatus + '\'' +
                ", transactionDate='" + transactionDate + '\'' +
                '}';
    }
}
