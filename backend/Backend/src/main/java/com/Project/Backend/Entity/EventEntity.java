package com.Project.Backend.Entity;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name ="Events")
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "event_Id")
public class EventEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int event_Id;

    @OneToMany(mappedBy = "event")
    @JsonManagedReference("event-transaction")
    private List<TransactionsEntity> transactions;

    private String event_name;
    @Column(columnDefinition = "TEXT")
    private String event_description;
    @Column(columnDefinition = "TEXT")
    private String event_summary;
    // Stores the admin-defined sections and assigned services as JSON
    @Column(columnDefinition = "LONGTEXT")
    private String event_sections;
    private boolean event_isAvailable;
    private double event_price;
    private String event_image;

    // List of allowed services for this event (flattened from sections)
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("event-allowed-services")
    private List<EventAllowedServiceEntity> allowedServices;

    public int getEvent_Id() {
        return event_Id;
    }

    public void setEvent_Id(int event_Id) {
        this.event_Id = event_Id;
    }

    public List<TransactionsEntity> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<TransactionsEntity> transactions) {
        this.transactions = transactions;
    }

    public String getEvent_name() {
        return event_name;
    }

    public void setEvent_name(String event_name) {
        this.event_name = event_name;
    }

    public String getEvent_summary() {
        return event_summary;
    }

    public void setEvent_summary(String event_summary) {
        this.event_summary = event_summary;
    }

    public String getEvent_description() {
        return event_description;
    }

    public void setEvent_description(String event_description) {
        this.event_description = event_description;
    }

    public String getEvent_sections() {
        return event_sections;
    }

    public void setEvent_sections(String event_sections) {
        this.event_sections = event_sections;
    }

    public boolean isEvent_isAvailable() {
        return event_isAvailable;
    }

    public void setEvent_isAvailable(boolean event_isAvailable) {
        this.event_isAvailable = event_isAvailable;
    }

    public double getEvent_price() {
        return event_price;
    }

    public void setEvent_price(double event_price) {
        this.event_price = event_price;
    }

    public String getEvent_image() {
        return event_image;
    }

    public void setEvent_image(String event_image) {
        this.event_image = event_image;
    }

    public List<EventAllowedServiceEntity> getAllowedServices() {
        return allowedServices;
    }

    public void setAllowedServices(List<EventAllowedServiceEntity> allowedServices) {
        this.allowedServices = allowedServices;
    }
}
