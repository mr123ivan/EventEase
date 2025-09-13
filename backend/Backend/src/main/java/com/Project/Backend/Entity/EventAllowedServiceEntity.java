package com.Project.Backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "event_allowed_services")
public class EventAllowedServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonBackReference("event-allowed-services")
    private EventEntity event;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subcontractor_service_id", nullable = false)
    private SubcontractorServiceEntity subcontractorService;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public EventEntity getEvent() { return event; }
    public void setEvent(EventEntity event) { this.event = event; }

    public SubcontractorServiceEntity getSubcontractorService() { return subcontractorService; }
    public void setSubcontractorService(SubcontractorServiceEntity subcontractorService) { this.subcontractorService = subcontractorService; }
}
