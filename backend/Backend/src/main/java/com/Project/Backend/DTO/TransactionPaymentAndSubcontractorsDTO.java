package com.Project.Backend.DTO;

import java.util.List;
import java.util.Map;

public class TransactionPaymentAndSubcontractorsDTO {
    int transaction_Id;
    String paymentReferenceNumber;
    String paymentNote;
    String paymentReciept;
    List<Map<String, Object>> subcontractors;

    public TransactionPaymentAndSubcontractorsDTO(int transaction_Id, String paymentReferenceNumber,
            String paymentNote, String paymentReciept,
            List<Map<String, Object>> subcontractors) {
        this.transaction_Id = transaction_Id;
        this.paymentReferenceNumber = paymentReferenceNumber;
        this.paymentNote = paymentNote;
        this.paymentReciept = paymentReciept;
        this.subcontractors = subcontractors;
    }

    public int getTransaction_Id() {
        return transaction_Id;
    }

    public void setTransaction_Id(int transaction_Id) {
        this.transaction_Id = transaction_Id;
    }

    public String getPaymentReferenceNumber() {
        return paymentReferenceNumber;
    }

    public void setPaymentReferenceNumber(String paymentReferenceNumber) {
        this.paymentReferenceNumber = paymentReferenceNumber;
    }

    public String getPaymentNote() {
        return paymentNote;
    }

    public void setPaymentNote(String paymentNote) {
        this.paymentNote = paymentNote;
    }

    public String getPaymentReciept() {
        return paymentReciept;
    }

    public void setPaymentReciept(String paymentReciept) {
        this.paymentReciept = paymentReciept;
    }

    public List<Map<String, Object>> getSubcontractors() {
        return subcontractors;
    }

    public void setSubcontractors(List<Map<String, Object>> subcontractors) {
        this.subcontractors = subcontractors;
    }
}
