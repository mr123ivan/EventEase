package com.Project.Backend.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Project.Backend.Entity.EventEntity;
import com.Project.Backend.Repository.EventRepository;
import com.Project.Backend.DTO.EventUpsertDTO;
import com.Project.Backend.Entity.EventAllowedServiceEntity;
import com.Project.Backend.Entity.SubcontractorServiceEntity;
import com.Project.Backend.Repository.EventAllowedServiceRepository;
import com.Project.Backend.Repository.SubcontractorServiceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;



@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private EventAllowedServiceRepository eventAllowedServiceRepository;

    @Autowired
    private SubcontractorServiceRepository subcontractorServiceRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public EventEntity create(EventEntity event) {
        return eventRepository.save(event);
    }

    public EventEntity readById(int id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found!"));
    }

    public List<EventEntity> readAll() {
        return eventRepository.findAll();
    }



    public EventEntity getEventByEventName(String eventName) {
        return eventRepository.findByName(eventName);
    }

    public EventEntity update(EventEntity event) {
        return eventRepository.save(event);
    }

    // Create event from DTO (persists event_sections JSON and allowed services)
    public EventEntity createFromDto(EventUpsertDTO dto) {
        EventEntity event = new EventEntity();
        event.setEvent_name(dto.getEvent_name());
        event.setEvent_summary(dto.getEvent_summary());
        event.setEvent_description(dto.getEvent_description());
        if (dto.getEvent_isAvailable() != null) {
            event.setEvent_isAvailable(dto.getEvent_isAvailable());
        }
        event.setEvent_image(dto.getEvent_image());
        // serialize sections
        setSectionsJson(event, dto);
        EventEntity saved = eventRepository.save(event);
        upsertAllowedServices(saved, dto);
        return saved;
    }

    // Update event from DTO
    public EventEntity updateFromDto(EventUpsertDTO dto) {
        if (dto.getEvent_Id() == null) throw new RuntimeException("event_Id is required for update");
        EventEntity event = eventRepository.findById(dto.getEvent_Id())
            .orElseThrow(() -> new RuntimeException("Event not found!"));
        event.setEvent_name(dto.getEvent_name());
        event.setEvent_summary(dto.getEvent_summary());
        event.setEvent_description(dto.getEvent_description());
        if (dto.getEvent_isAvailable() != null) {
            event.setEvent_isAvailable(dto.getEvent_isAvailable());
        }
        if (dto.getEvent_image() != null) {
            event.setEvent_image(dto.getEvent_image());
        }
        setSectionsJson(event, dto);
        EventEntity saved = eventRepository.save(event);
        // reset allowed services then insert
        List<EventAllowedServiceEntity> existing = eventAllowedServiceRepository.findByEventId(saved.getEvent_Id());
        if (!existing.isEmpty()) {
            eventAllowedServiceRepository.deleteAll(existing);
        }
        upsertAllowedServices(saved, dto);
        return saved;
    }

    private void setSectionsJson(EventEntity event, EventUpsertDTO dto) {
        try {
            if (dto.getEvent_sections() != null) {
                String json = objectMapper.writeValueAsString(dto.getEvent_sections());
                event.setEvent_sections(json);
            } else {
                event.setEvent_sections(null);
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize event_sections", e);
        }
    }

    private void upsertAllowedServices(EventEntity event, EventUpsertDTO dto) {
        if (dto.getEvent_sections() == null) return;
        // flatten service ids
        dto.getEvent_sections().forEach(section -> {
            if (section.getServices() == null) return;
            section.getServices().forEach(serviceMap -> {
                Object idObj = serviceMap.get("id");
                if (idObj == null) return;
                int serviceId;
                if (idObj instanceof Number) {
                    serviceId = ((Number) idObj).intValue();
                } else {
                    try { serviceId = Integer.parseInt(idObj.toString()); }
                    catch (NumberFormatException ex) { return; }
                }
                SubcontractorServiceEntity svc = subcontractorServiceRepository.findById(serviceId)
                    .orElse(null);
                if (svc != null) {
                    EventAllowedServiceEntity allowed = new EventAllowedServiceEntity();
                    allowed.setEvent(event);
                    allowed.setSubcontractorService(svc);
                    eventAllowedServiceRepository.save(allowed);
                }
            });
        });
    }

    public void deleteById(int id) {
        eventRepository.deleteById(id);
    }
    
    public EventEntity updateEventImage(int eventId, MultipartFile file) throws IOException {
        EventEntity event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        
        if (file != null && !file.isEmpty()) {
            // Delete the previous image from S3 (if it exists)
            String existingImageUrl = event.getEvent_image();
            if (existingImageUrl != null && !existingImageUrl.isEmpty()) {
                // TODO: Implement S3 delete if needed
            }

            // Convert MultipartFile to File
            File convFile = File.createTempFile("upload", file.getOriginalFilename());
            file.transferTo(convFile);

            // Upload new image to S3
            String newImageUrl = s3Service.upload(convFile, "event_images", file.getOriginalFilename());
            event.setEvent_image(newImageUrl);

            // Delete temp file
            convFile.delete();
        }

        return eventRepository.save(event);
    }


    // public List<EventEntity> readAvailable() {
    //     return eventRepository.findByIsAvailableTrue();
    // }
}
