package com.Project.Backend.DTO;

import java.util.List;

public class EventUpsertDTO {
    private Integer event_Id; // for update
    private String event_name;
    private String event_summary;
    private String event_description;
    private Boolean event_isAvailable;
    private String event_image; // optional
    private List<EventSectionDTO> event_sections;

    public Integer getEvent_Id() { return event_Id; }
    public void setEvent_Id(Integer event_Id) { this.event_Id = event_Id; }

    public String getEvent_name() { return event_name; }
    public void setEvent_name(String event_name) { this.event_name = event_name; }

    public String getEvent_summary() { return event_summary; }
    public void setEvent_summary(String event_summary) { this.event_summary = event_summary; }

    public String getEvent_description() { return event_description; }
    public void setEvent_description(String event_description) { this.event_description = event_description; }

    public Boolean getEvent_isAvailable() { return event_isAvailable; }
    public void setEvent_isAvailable(Boolean event_isAvailable) { this.event_isAvailable = event_isAvailable; }

    public String getEvent_image() { return event_image; }
    public void setEvent_image(String event_image) { this.event_image = event_image; }

    public List<EventSectionDTO> getEvent_sections() { return event_sections; }
    public void setEvent_sections(List<EventSectionDTO> event_sections) { this.event_sections = event_sections; }
}
