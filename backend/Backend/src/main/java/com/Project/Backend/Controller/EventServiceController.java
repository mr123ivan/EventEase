package com.Project.Backend.Controller;

import com.Project.Backend.Entity.EventServiceEntity;
import com.Project.Backend.Entity.SubcontractorEntity;
import com.Project.Backend.Service.EventServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.Project.Backend.DTO.GetTransactionDTO;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event-services")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class EventServiceController {

    @Autowired
    private EventServiceService eventServiceService;

    // Get all event services for a transaction
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<List<EventServiceEntity>> getEventServicesByTransaction(@PathVariable int transactionId) {
        try {
            List<EventServiceEntity> eventServices = eventServiceService.getByTransactionId(transactionId);
            return ResponseEntity.ok(eventServices);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all unassigned event services (no subcontractor assigned)
    @GetMapping("/unassigned")
    public ResponseEntity<List<EventServiceEntity>> getUnassignedEventServices() {
        List<EventServiceEntity> unassignedServices = eventServiceService.getUnassignedEventServices();
        return ResponseEntity.ok(unassignedServices);
    }

    // Assign subcontractor service to event service
    @PutMapping("/{eventServiceId}/assign-subcontractor-service")
    public ResponseEntity<?> assignSubcontractorService(
            @PathVariable int eventServiceId,
            @RequestParam int subcontractorServiceId) {
        try {
            EventServiceEntity updatedEventService = eventServiceService.assignSubcontractorService(eventServiceId, subcontractorServiceId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Subcontractor service assigned successfully",
                "eventService", updatedEventService
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Remove subcontractor service from event service
    @PutMapping("/{eventServiceId}/remove-subcontractor-service")
    public ResponseEntity<?> removeSubcontractorService(@PathVariable int eventServiceId) {
        try {
            EventServiceEntity updatedEventService = eventServiceService.removeSubcontractorService(eventServiceId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Subcontractor service removed successfully",
                "eventService", updatedEventService
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get available subcontractors for a specific service category
    @GetMapping("/available-subcontractors")
    public ResponseEntity<List<SubcontractorEntity>> getAvailableSubcontractors(
            @RequestParam String serviceCategory,
            @RequestParam String eventDate) {
        try {
            List<SubcontractorEntity> availableSubcontractors = 
                eventServiceService.getAvailableSubcontractors(serviceCategory, eventDate);
            return ResponseEntity.ok(availableSubcontractors);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Bulk assign subcontractor services to multiple event services
    @PutMapping("/bulk-assign-services")
    public ResponseEntity<?> bulkAssignSubcontractorServices(@RequestBody Map<Integer, Integer> assignments) {
        try {
            // assignments is a map of eventServiceId -> subcontractorServiceId
            List<EventServiceEntity> updatedServices = eventServiceService.bulkAssignSubcontractorServices(assignments);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Subcontractor services assigned successfully",
                "updatedServices", updatedServices
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get event service details by ID
    @GetMapping("/{eventServiceId}")
    public ResponseEntity<EventServiceEntity> getEventServiceById(@PathVariable int eventServiceId) {
        try {
            EventServiceEntity eventService = eventServiceService.getById(eventServiceId);
            return ResponseEntity.ok(eventService);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
