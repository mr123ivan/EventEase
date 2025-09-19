package com.Project.Backend.DTO;

import com.Project.Backend.Entity.*;

import java.io.Serializable;
import java.sql.Date;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class GetTransactionDTO {
    private int transaction_Id;
    private String userEmail;
    private String userName;
    private String phoneNumber;
    private String userAddress; //userdata
    private String eventName;
    private String transactionVenue;
    private String transactionStatus;
    private Date transactionDate;
    private String transactionNote;
    private String packages;
    private PaymentEntity payment;
    private List<Map<String, Object>>subcontractors;
    private RejectNoteDTO rejectedNote;

    public GetTransactionDTO() {
        this.subcontractors = new ArrayList<>();
        this.payment = new PaymentEntity();
    }

    public GetTransactionDTO(TransactionsEntity transaction) {
        this.transaction_Id = transaction.getTransaction_Id();
        this.userEmail = transaction.getUser().getEmail();
        this.userName = transaction.getUser().getFirstname() + " " + transaction.getUser().getLastname();
        this.phoneNumber = transaction.getUser().getPhoneNumber();
        this.userAddress = transaction.getUser().getRegion() + ", " + transaction.getUser().getCityAndMul() + ", " + transaction.getUser().getBarangay();
        this.eventName = transaction.getEvent().getEvent_name();
        this.transactionVenue = transaction.getTransactionVenue();
        this.transactionStatus = transaction.getTransactionStatus().toString();
        this.transactionDate = transaction.getTransactionDate();
        this.transactionNote = transaction.getTransactionNote();
        
        if(transaction.getPackages() != null) {
            this.packages = transaction.getPackages().getPackageName();
        }
        
        if(transaction.getPayment() != null) {
            this.payment = transaction.getPayment();
        }

        this.subcontractors = transaction.getEventServices().stream()
            .filter(eventService -> eventService.getSubcontractorService() != null) // Filter out null subcontractor services
            .map(eventService -> {
                SubcontractorServiceEntity subcontractorService = eventService.getSubcontractorService();
                SubcontractorEntity subcontractor = subcontractorService.getSubcontractor();
                Map<String, Object> subcontractorMap = new HashMap<>();
                subcontractorMap.put("subcontractorUserId", subcontractor.getUser() != null ? subcontractor.getUser().getUserId() : 0);
                subcontractorMap.put("subcontractorEntityId", subcontractor.getSubcontractor_Id()); // Add the correct subcontractor entity ID
                subcontractorMap.put("subcontractorName", subcontractor.getUser() != null ?
                    subcontractor.getUser().getFirstname() + " " + subcontractor.getUser().getLastname() :
                    subcontractor.getSubcontractor_serviceName());
                subcontractorMap.put("subcontractorEmail", subcontractor.getUser() != null ? subcontractor.getUser().getEmail() : "N/A");
                subcontractorMap.put("subcontractorPhone", subcontractor.getUser() != null ? subcontractor.getUser().getPhoneNumber() : "N/A");
                subcontractorMap.put("subcontractorAddress", subcontractor.getUser() != null ?
                    subcontractor.getUser().getRegion() + ", " + subcontractor.getUser().getCityAndMul() + ", " + subcontractor.getUser().getBarangay() :
                    "N/A");
                subcontractorMap.put("eventServiceId", eventService.getEventServices_id());
                subcontractorMap.put("serviceName", subcontractorService.getName());
                subcontractorMap.put("serviceCategory", ""); // No serviceCategory field in SubcontractorServiceEntity
                subcontractorMap.put("subcontractor_service_description", ""); // No description field in SubcontractorServiceEntity
                subcontractorMap.put("subcontractor_service_price", subcontractorService.getPrice());
                subcontractorMap.put("checkInStatus", "pending");
                subcontractorMap.put("progressPercentage", 0);
                subcontractorMap.put("notes", "");
                return subcontractorMap;
            })
            .collect(Collectors.toList());
    }

    public RejectNoteDTO getRejectedNote() {
        return rejectedNote;
    }

    public void setRejectedNote(RejectNoteDTO rejectedNote) {
        this.rejectedNote = rejectedNote;
    }

    public String getTransactionNote() {
        return transactionNote;
    }

    public void setTransactionNote(String transactionNote) {
        this.transactionNote = transactionNote;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getUserAddress() {
        return userAddress;
    }

    public void setUserAddress(String userAddress) {
        this.userAddress = userAddress;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
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

    public Date getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(Date transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getPackages() {
        return packages;
    }

    public void setPackages(String packages) {
        this.packages = packages;
    }

    public PaymentEntity getPayment() {
        return payment;
    }

    public void setPayment(PaymentEntity payment) {
        this.payment = payment;
    }

    public List<Map<String, Object>> getSubcontractors() {
        return subcontractors;
    }

    public void setSubcontractors(List<Map<String, Object>> subcontractors) {
        this.subcontractors = subcontractors;
    }

    public int getTransaction_Id() {
        return transaction_Id;
    }

    public void setTransaction_Id(int transaction_Id) {
        this.transaction_Id = transaction_Id;
    }
}
