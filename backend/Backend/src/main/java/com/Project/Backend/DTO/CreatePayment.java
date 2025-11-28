package com.Project.Backend.DTO;

public class CreatePayment {
    private int transactionId;
    private String paymentNote;
    private String paymentReceipt;
    private String paymentReferenceNumber;
    private String imageUrl;

    public CreatePayment(int transactionId, String paymentNote, String paymentReceipt, String paymentReferenceNumber,
            String imageUrl) {
        this.transactionId = transactionId;
        this.paymentNote = paymentNote;
        this.paymentReceipt = paymentReceipt;
        this.paymentReferenceNumber = paymentReferenceNumber;
        this.imageUrl = imageUrl;
    }

    public int getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(int transactionId) {
        this.transactionId = transactionId;
    }

    public String getPaymentNote() {
        return paymentNote;
    }

    public void setPaymentNote(String paymentNote) {
        this.paymentNote = paymentNote;
    }

    public String getPaymentReceipt() {
        return paymentReceipt;
    }

    public void setPaymentReceipt(String paymentReceipt) {
        this.paymentReceipt = paymentReceipt;
    }

    public String getPaymentReferenceNumber() {
        return paymentReferenceNumber;
    }

    public void setPaymentReferenceNumber(String paymentReferenceNumber) {
        this.paymentReferenceNumber = paymentReferenceNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

}
