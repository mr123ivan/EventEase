package com.Project.Backend.Controller;

import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.Project.Backend.DTO.CreateSubcontractorRequest;
import com.Project.Backend.DTO.CreateBasicSubcontractorRequest;
import com.Project.Backend.DTO.GetSubcontractor;
import com.Project.Backend.DTO.SubcontractorDescriptionDTO;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.Project.Backend.Service.TransactionService;
import com.Project.Backend.Service.EventServiceService;
import com.Project.Backend.DTO.GetTransactionDTO;

import com.Project.Backend.Entity.SubcontractorEntity;
import com.Project.Backend.Service.SubcontractorService;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/subcontractor")
public class SubcontractorController {

    @Autowired
    private SubcontractorService subcontractorService;
//    @Autowired
//    private TransactionService transactionService;
//    @Autowired
//    private EventServiceService eventServiceService;

    @GetMapping("/getall")
    public ResponseEntity<List<SubcontractorEntity>> getAllSubcontractors() {
        return ResponseEntity.ok(subcontractorService.getAllSubcontractors());
    }

    @GetMapping("/getdetails/{email}")
    public ResponseEntity<?> getSubcontractorDetails(@PathVariable String email) {
        SubcontractorEntity subcontractor = subcontractorService.getSubcontractorByEmail(email);
        if(subcontractor == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subcontractor);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubcontractorEntity> getSubcontractorById(@PathVariable int id) {
        SubcontractorEntity subcontractor = subcontractorService.getSubcontractorById(id);
        return ResponseEntity.ok(subcontractor);
    }

    @GetMapping("/available/{date}")
    public ResponseEntity<List<GetSubcontractor>> getAvailableSubcontractorByDate(@PathVariable Date date) {
        List<GetSubcontractor> subcontractors = subcontractorService.getAvailableSubcontractors(date);
        if(subcontractors.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subcontractors);
    }


    @PutMapping("/edit-description")
    public ResponseEntity<?> editSubcontractorDescription(
                                @RequestBody SubcontractorDescriptionDTO subcontractorDescriptionDTO) {
            String message = subcontractorService.editDescription(subcontractorDescriptionDTO.getEmail(),
                                                                  subcontractorDescriptionDTO.getDescription());
            if(message.equals("Error")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Error in updating description" ));
            }
        return ResponseEntity.ok(Map.of("message", message));
    }


    @PostMapping("/create")
    public ResponseEntity<SubcontractorEntity> createSubcontractor(@RequestBody CreateSubcontractorRequest request) {
        SubcontractorEntity subcontractor = new SubcontractorEntity();
        subcontractor.setUser(request.getUser());
        subcontractor.setSubcontractor_description(request.getDescription());
        subcontractor.setSubcontractor_serviceName(request.getService());
        subcontractor.setUnavailableDates(null);
        subcontractor.setSubcontractor_serviceCategory(request.getServiceCategory());
        subcontractor.setSubcontractor_service_price(request.getServicePrice());

        //create object for package service -> what package of tulip, cherry blossom, he's available

        subcontractor.setEventName(null);
        subcontractor.setShowcase(null);
        SubcontractorEntity savedSubcontractor = subcontractorService.saveSubcontractor(subcontractor);
        return ResponseEntity.ok(savedSubcontractor);
    }

    // New simplified creation endpoint: business name, contact person, and services
    @PostMapping("/create-basic")
    public ResponseEntity<SubcontractorEntity> createBasic(@RequestBody CreateBasicSubcontractorRequest request) {
        SubcontractorEntity saved = subcontractorService.createBasicSubcontractor(request);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubcontractor(@PathVariable int id) {
        subcontractorService.deleteSubcontractor(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get counts of subcontractors by service category
     * Used in the admin dashboard to display category statistics
     * @return List of maps with category and count
     */
    @GetMapping("/category-counts")
    public ResponseEntity<List<Map<String, Object>>> getSubcontractorCountsByCategory() {
        List<Map<String, Object>> categoryCounts = subcontractorService.getSubcontractorCountsByCategory();
        
        // Add total count
        Map<String, Object> totalCount = new HashMap<>();
        totalCount.put("category", "total");
        totalCount.put("count", subcontractorService.getAllSubcontractors().size());
        categoryCounts.add(0, totalCount); // Add at the beginning of the list
        
        return ResponseEntity.ok(categoryCounts);
    }
}
