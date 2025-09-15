package com.Project.Backend.DTO;

import java.util.List;
import java.util.Map;

public class EventSectionDTO {
    private String title;
    private boolean required;
    private boolean multi;
    // Services as generic maps to tolerate different frontend shapes (expects at least an "id")
    private List<Map<String, Object>> services;
    // Packages as generic maps (expects at least an "id")
    private List<Map<String, Object>> packages;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }

    public boolean isMulti() { return multi; }
    public void setMulti(boolean multi) { this.multi = multi; }

    public List<Map<String, Object>> getServices() { return services; }
    public void setServices(List<Map<String, Object>> services) { this.services = services; }

    public List<Map<String, Object>> getPackages() { return packages; }
    public void setPackages(List<Map<String, Object>> packages) { this.packages = packages; }
}
