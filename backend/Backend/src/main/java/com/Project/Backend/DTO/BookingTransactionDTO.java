package com.Project.Backend.DTO;

import java.sql.Date;
import java.util.List;

public class BookingTransactionDTO {
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    private String contact;
    
    // Event Details
    private String eventName;
    private Integer eventId;
    private String transactionVenue;
    private Date transactionDate;
    private String transactionNote;
    
    // Additional Event Details
    private String celebrantName;
    private String additionalCelebrants;
    private Integer projectedAttendees;
    private Double budget;
    
    // Services
    private String serviceType; // "PACKAGE" or "CUSTOM"
    private Integer packageId; // if package selected
    private List<Integer> serviceIds; // if custom services selected
    
    // Payment
    private String paymentReceipt; // URL of uploaded payment proof
    private String paymentNote;
    private String paymentReferenceNumber; // Reference number from user's payment
    
    // User
    private String userEmail; // to identify the user

    // Constructors
    public BookingTransactionDTO() {}

    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public Integer getEventId() {
        return eventId;
    }

    public void setEventId(Integer eventId) {
        this.eventId = eventId;
    }

    public String getTransactionVenue() {
        return transactionVenue;
    }

    public void setTransactionVenue(String transactionVenue) {
        this.transactionVenue = transactionVenue;
    }

    public Date getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(Date transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getTransactionNote() {
        return transactionNote;
    }

    public void setTransactionNote(String transactionNote) {
        this.transactionNote = transactionNote;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public Integer getPackageId() {
        return packageId;
    }

    public void setPackageId(Integer packageId) {
        this.packageId = packageId;
    }

    public List<Integer> getServiceIds() {
        return serviceIds;
    }

    public void setServiceIds(List<Integer> serviceIds) {
        this.serviceIds = serviceIds;
    }

    public String getPaymentReceipt() {
        return paymentReceipt;
    }

    public void setPaymentReceipt(String paymentReceipt) {
        this.paymentReceipt = paymentReceipt;
    }

    public String getPaymentNote() {
        return paymentNote;
    }

    public void setPaymentNote(String paymentNote) {
        this.paymentNote = paymentNote;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getPaymentReferenceNumber() {
        return paymentReferenceNumber;
    }

    public void setPaymentReferenceNumber(String paymentReferenceNumber) {
        this.paymentReferenceNumber = paymentReferenceNumber;
    }
    
    public String getCelebrantName() {
        return celebrantName;
    }

    public void setCelebrantName(String celebrantName) {
        this.celebrantName = celebrantName;
    }

    public String getAdditionalCelebrants() {
        return additionalCelebrants;
    }

    public void setAdditionalCelebrants(String additionalCelebrants) {
        this.additionalCelebrants = additionalCelebrants;
    }

    public Integer getProjectedAttendees() {
        return projectedAttendees;
    }

    public void setProjectedAttendees(Integer projectedAttendees) {
        this.projectedAttendees = projectedAttendees;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }
}
