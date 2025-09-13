package com.Project.Backend.Controller;


import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Project.Backend.Entity.EventEntity;
import com.Project.Backend.Service.EventService;
import com.Project.Backend.DTO.EventUpsertDTO;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping("/createEvent")
    public ResponseEntity<EventEntity> create(@RequestBody EventUpsertDTO dto) {
        return ResponseEntity.ok(eventService.createFromDto(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventEntity> readById(@PathVariable int id) {
        return ResponseEntity.ok(eventService.readById(id));
    }

    @GetMapping("/event-details/{event_name}")
    public ResponseEntity<EventEntity> readByEventName(@PathVariable String event_name) {
        EventEntity event = eventService.getEventByEventName(event_name);
        if(event == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(event);
    }

    @GetMapping("/getEvents")
    public ResponseEntity<List<EventEntity>> readAll() {
        return ResponseEntity.ok(eventService.readAll());
    }


    @PutMapping
    public ResponseEntity<EventEntity> update(@RequestBody EventUpsertDTO dto) {
        // Backward tolerance: if id is missing but name exists, try to resolve by name
        if (dto.getEvent_Id() == null && dto.getEvent_name() != null) {
            EventEntity existing = eventService.getEventByEventName(dto.getEvent_name());
            if (existing != null) {
                dto.setEvent_Id(existing.getEvent_Id());
            }
        }
        if (dto.getEvent_Id() == null) {
            // If still null, treat as create to avoid losing sections from frontend
            return ResponseEntity.ok(eventService.createFromDto(dto));
        }
        return ResponseEntity.ok(eventService.updateFromDto(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable int id) {
        eventService.deleteById(id);
        return ResponseEntity.noContent().build();
    }


    // @GetMapping("/available")
    // public ResponseEntity<List<EventEntity>> readAvailable() {
    //     return ResponseEntity.ok(eventService.readAvailable());
    // }

    @PostMapping("/upload/image/{eventId}")
    public ResponseEntity<?> uploadEventImage(
        @PathVariable int eventId,
        @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            EventEntity updatedEvent = eventService.updateEventImage(eventId, file);
            return ResponseEntity.ok(updatedEvent);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Event image upload failed: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Event not found: " + e.getMessage());
        }
    }
}
