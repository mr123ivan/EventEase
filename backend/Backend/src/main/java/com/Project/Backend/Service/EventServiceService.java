package com.Project.Backend.Service;

import com.Project.Backend.Entity.EventServiceEntity;
import com.Project.Backend.Entity.SubcontractorEntity;
import com.Project.Backend.Entity.SubcontractorServiceEntity;
import com.Project.Backend.Entity.TransactionsEntity;
import com.Project.Backend.Repository.EventServiceRepository;
import com.Project.Backend.Repository.SubContractorRepository;
import com.Project.Backend.Repository.SubcontractorServiceRepository;
import com.Project.Backend.Repository.TransactionRepo;
import com.Project.Backend.DTO.GetTransactionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.Collectors;


import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class EventServiceService {

    @Autowired
    private EventServiceRepository eventServiceRepository;

    @Autowired
    private SubContractorRepository subcontractorRepository;

    @Autowired
    private TransactionRepo transactionRepository;

    @Autowired
    private SubcontractorServiceRepository subcontractorServiceRepository;

    public EventServiceEntity create(EventServiceEntity eventService) {
        return eventServiceRepository.save(eventService);
    }

    public EventServiceEntity readById(int id) {
        return eventServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public List<EventServiceEntity> getAll(){
        return eventServiceRepository.findAll();
    }

    public EventServiceEntity update(EventServiceEntity eventService) {
        return eventServiceRepository.save(eventService);
    }

    public void deleteById(int id) {
        eventServiceRepository.deleteById(id);
    }

        // Get event services by transaction ID
    public List<EventServiceEntity> getByTransactionId(int transactionId) {
        TransactionsEntity transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + transactionId));
        return transaction.getEventServices();

        
    }

    // Get all unassigned event services
    public List<EventServiceEntity> getUnassignedEventServices() {
        return eventServiceRepository.findBySubcontractorServiceIsNull();
    }

    // Assign subcontractor service to event service
    public EventServiceEntity assignSubcontractorService(int eventServiceId, int subcontractorServiceId) {
        EventServiceEntity eventService = eventServiceRepository.findById(eventServiceId)
            .orElseThrow(() -> new RuntimeException("Event service not found with ID: " + eventServiceId));

        // Find the subcontractor service entity
        SubcontractorServiceEntity subcontractorService = subcontractorServiceRepository.findById(subcontractorServiceId)
            .orElseThrow(() -> new RuntimeException("SubcontractorService not found with ID: " + subcontractorServiceId));

        SubcontractorEntity subcontractor = subcontractorService.getSubcontractor();

        // Check if subcontractor is available for the event date
        Date eventDate = eventService.getTransactionsId().getTransactionDate();
        if (!isSubcontractorAvailable(subcontractor, eventDate)) {
            throw new RuntimeException("Subcontractor is not available on the event date");
        }

        eventService.setSubcontractorService(subcontractorService);
        return eventServiceRepository.save(eventService);
    }

    // Remove subcontractor service from event service
    public EventServiceEntity removeSubcontractorService(int eventServiceId) {
        EventServiceEntity eventService = eventServiceRepository.findById(eventServiceId)
            .orElseThrow(() -> new RuntimeException("Event service not found with ID: " + eventServiceId));

        eventService.setSubcontractorService(null);
        return eventServiceRepository.save(eventService);
    }

    // Get available subcontractors for a service category and date
    public List<SubcontractorEntity> getAvailableSubcontractors(String serviceCategory, String eventDateStr) {
        Date eventDate = Date.valueOf(eventDateStr);
        List<SubcontractorEntity> allSubcontractors = subcontractorRepository.findBySubcontractorServiceCategory(serviceCategory);
        
        List<SubcontractorEntity> availableSubcontractors = new ArrayList<>();
        for (SubcontractorEntity subcontractor : allSubcontractors) {
            if (isSubcontractorAvailable(subcontractor, eventDate)) {
                availableSubcontractors.add(subcontractor);
            }
        }
        
        return availableSubcontractors;
    }

    // Bulk assign subcontractor services
    public List<EventServiceEntity> bulkAssignSubcontractorServices(Map<Integer, Integer> assignments) {
        List<EventServiceEntity> updatedServices = new ArrayList<>();

        for (Map.Entry<Integer, Integer> assignment : assignments.entrySet()) {
            int eventServiceId = assignment.getKey();
            int subcontractorServiceId = assignment.getValue();

            EventServiceEntity updatedService = assignSubcontractorService(eventServiceId, subcontractorServiceId);
            updatedServices.add(updatedService);
        }

        return updatedServices;
    }

    // Get event service by ID
    public EventServiceEntity getById(int eventServiceId) {
        return eventServiceRepository.findById(eventServiceId)
            .orElseThrow(() -> new RuntimeException("Event service not found with ID: " + eventServiceId));
    }

    // Helper method to check if subcontractor is available on a specific date
    private boolean isSubcontractorAvailable(SubcontractorEntity subcontractor, Date eventDate) {
        // Check if the subcontractor has any unavailable dates that conflict with the event date
        return subcontractor.getUnavailableDates().stream()
            .noneMatch(unavailableDate -> 
                eventDate.equals(unavailableDate.getDate())
            );
    }

}
