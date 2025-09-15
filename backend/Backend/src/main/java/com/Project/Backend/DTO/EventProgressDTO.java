package com.Project.Backend.DTO;

import java.time.LocalDateTime;
import java.util.List;

public class EventProgressDTO {
    private int transactionId;
    private String eventName;
    private String location;
    private String startDate;
    private String currentStatus;
    private String checkInStatus;
    private String notes;
    private int progressPercentage;
    private LocalDateTime lastUpdate;
    private List<SubcontractorProgressDTO> subcontractors;

    // Constructor
    public EventProgressDTO(int transactionId, String eventName, String location, String startDate,
                          String currentStatus, String checkInStatus, String notes, int progressPercentage,
                          LocalDateTime lastUpdate, List<SubcontractorProgressDTO> subcontractors) {
        this.transactionId = transactionId;
        this.eventName = eventName;
        this.location = location;
        this.startDate = startDate;
        this.currentStatus = currentStatus;
        this.checkInStatus = checkInStatus;
        this.notes = notes;
        this.progressPercentage = progressPercentage;
        this.lastUpdate = lastUpdate;
        this.subcontractors = subcontractors;
    }

    // Getters and Setters
    public int getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(int transactionId) {
        this.transactionId = transactionId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public String getCheckInStatus() {
        return checkInStatus;
    }

    public void setCheckInStatus(String checkInStatus) {
        this.checkInStatus = checkInStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(LocalDateTime lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public List<SubcontractorProgressDTO> getSubcontractors() {
        return subcontractors;
    }

    public void setSubcontractors(List<SubcontractorProgressDTO> subcontractors) {
        this.subcontractors = subcontractors;
    }

    @Override
    public String toString() {
        return "EventProgressDTO{" +
                "transactionId=" + transactionId +
                ", eventName='" + eventName + '\'' +
                ", location='" + location + '\'' +
                ", currentStatus='" + currentStatus + '\'' +
                ", progressPercentage=" + progressPercentage +
                ", subcontractorsCount=" + (subcontractors != null ? subcontractors.size() : 0) +
                '}';
    }
}
