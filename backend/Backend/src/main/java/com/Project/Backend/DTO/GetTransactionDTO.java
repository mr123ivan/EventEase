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
            .filter(eventService -> eventService.getSubcontractor() != null) // Filter out null subcontractors
            .map(eventService -> {
                Map<String, Object> subcontractorMap = new HashMap<>();
                subcontractorMap.put("subcontractorUserId", eventService.getSubcontractor().getUser() != null ? eventService.getSubcontractor().getUser().getUserId() : 0);
                subcontractorMap.put("subcontractorEntityId", eventService.getSubcontractor().getSubcontractor_Id()); // Add the correct subcontractor entity ID
                subcontractorMap.put("subcontractorName", eventService.getSubcontractor().getUser() != null ?
                    eventService.getSubcontractor().getUser().getFirstname() + " " + eventService.getSubcontractor().getUser().getLastname() :
                    eventService.getSubcontractor().getSubcontractor_serviceName());
                subcontractorMap.put("subcontractorEmail", eventService.getSubcontractor().getUser() != null ? eventService.getSubcontractor().getUser().getEmail() : "N/A");
                subcontractorMap.put("subcontractorPhone", eventService.getSubcontractor().getUser() != null ? eventService.getSubcontractor().getUser().getPhoneNumber() : "N/A");
                subcontractorMap.put("subcontractorAddress", eventService.getSubcontractor().getUser() != null ?
                    eventService.getSubcontractor().getUser().getRegion() + ", " + eventService.getSubcontractor().getUser().getCityAndMul() + ", " + eventService.getSubcontractor().getUser().getBarangay() :
                    "N/A");
                subcontractorMap.put("serviceName", eventService.getSubcontractor().getSubcontractor_serviceName());
                subcontractorMap.put("serviceCategory", eventService.getSubcontractor().getSubcontractor_serviceCategory());
                subcontractorMap.put("subcontractor_service_description", eventService.getSubcontractor().getSubcontractor_description());
                subcontractorMap.put("subcontractor_service_price", eventService.getSubcontractor().getSubcontractor_service_price());
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
