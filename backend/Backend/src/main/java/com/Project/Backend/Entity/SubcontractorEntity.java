package com.Project.Backend.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Subcontractors")
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "subcontractor_Id")
public class SubcontractorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int subcontractor_Id;

    @Column(columnDefinition = "TEXT")
    private String subcontractor_description;
    private String subcontractor_serviceName;
    private String subcontractor_serviceCategory;
    private double subcontractor_service_price;

    // New simplified fields
    private String businessName;
    private String contactPerson;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "user_id")
    @JsonManagedReference("subcontractor-user")
    private UserEntity user;

    //here
    @OneToMany(mappedBy = "subcontractor", cascade = CascadeType.REMOVE)
    @JsonManagedReference("subcontactor-showcase")
    private List<ShowcaseEntity> showcase;

    @OneToMany(mappedBy = "subcontractor", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JsonManagedReference(value = "subcontractor-unavailable-dates")
    private List<UnavailableDatesEntity> unavailableDates;

    @OneToMany(mappedBy = "subcontractor", cascade = CascadeType.REMOVE)
    @JsonManagedReference("subcontractor-eventservice")
    private List<EventServiceEntity> eventName;

    @OneToMany(mappedBy = "subcontractor", cascade = CascadeType.REMOVE)
    @JsonManagedReference("subcontractor-package-service")
    private List<PackageServicesEntity> packageServices;

    // New: services offered by this subcontractor (name + price)
    @OneToMany(mappedBy = "subcontractor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("subcontractor-services")
    private List<SubcontractorServiceEntity> services;

    public int getSubcontractor_Id() {
        return subcontractor_Id;
    }

    public void setSubcontractor_Id(int subcontractor_Id) {
        this.subcontractor_Id = subcontractor_Id;
    }

    public String getSubcontractor_description() {
        return subcontractor_description;
    }

    public void setSubcontractor_description(String subcontractor_description) {
        this.subcontractor_description = subcontractor_description;
    }

    public String getSubcontractor_serviceName() {
        return subcontractor_serviceName;
    }

    public void setSubcontractor_serviceName(String subcontractor_serviceName) {
        this.subcontractor_serviceName = subcontractor_serviceName;
    }


    public List<ShowcaseEntity> getShowcase() {
        return showcase;
    }

    public void setShowcase(List<ShowcaseEntity> showcase) {
        this.showcase = showcase;
    }

    public List<UnavailableDatesEntity> getUnavailableDates() {
        return unavailableDates;
    }

    public void setUnavailableDates(List<UnavailableDatesEntity> unavailableDates) {
        this.unavailableDates = unavailableDates;
    }

    public List<EventServiceEntity> getEventName() {
        return eventName;
    }

    public void setEventName(List<EventServiceEntity> eventName) {
        this.eventName = eventName;
    }

    public List<PackageServicesEntity> getPackageServices() {
        return packageServices;
    }

    public void setPackageServices(List<PackageServicesEntity> packageServices) {
        this.packageServices = packageServices;
    }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public List<SubcontractorServiceEntity> getServices() { return services; }
    public void setServices(List<SubcontractorServiceEntity> services) { this.services = services; }

    public String getSubcontractor_serviceCategory() {
        return subcontractor_serviceCategory;
    }

    public void setSubcontractor_serviceCategory(String subcontractor_serviceCategory) {
        this.subcontractor_serviceCategory = subcontractor_serviceCategory;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public double getSubcontractor_service_price() {
        return subcontractor_service_price;
    }

    public void setSubcontractor_service_price(double subcontractor_service_price) {
        this.subcontractor_service_price = subcontractor_service_price;
    }
}
