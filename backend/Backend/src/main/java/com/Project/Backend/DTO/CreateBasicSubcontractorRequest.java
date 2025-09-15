package com.Project.Backend.DTO;

import java.util.List;

public class CreateBasicSubcontractorRequest {
    private String businessName;
    private String contactPerson;
    private List<ServiceItem> services;

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public List<ServiceItem> getServices() { return services; }
    public void setServices(List<ServiceItem> services) { this.services = services; }

    public static class ServiceItem {
        private String name;
        private double price;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
    }
}
