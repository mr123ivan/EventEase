package com.Project.Backend.Service;

import com.Project.Backend.DTO.*;
import com.Project.Backend.Entity.*;
import com.Project.Backend.Repository.EventRepository;
import com.Project.Backend.Repository.EventServiceRepository;
import com.Project.Backend.Repository.PackageServicesRepository;
import com.Project.Backend.Repository.PackagesRepository;
import com.Project.Backend.Repository.PaymentRepository;
import com.Project.Backend.Repository.SubcontractorServiceRepository;
import com.Project.Backend.Repository.TransactionRepo;
import com.Project.Backend.Repository.UserRepository;

import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepo transactionRepo;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private SubcontractorService subcontractorService;
    
    @Autowired
    private PackagesService packagesService;
    
    @Autowired
    private EventServiceService eventServiceService;
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    UserService userService;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PackagesRepository packageRepository;

    @Autowired
    private EventServiceRepository EventServiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRejectionNoteService bookingRejectionNoteService;

    @Autowired
    private TransactionProgressService transactionProgressService;

    @Autowired
    private SubcontractorServiceRepository subcontractorServiceRepository;


    public TransactionsEntity create(CreateTransactionDTO createTransactionDTO) {
        try{
            TransactionsEntity transactions = new TransactionsEntity();
            transactions.setTransactionVenue(createTransactionDTO.getVenue());
            transactions.setTransactionStatus(TransactionsEntity.Status.PENDING);
            transactions.setTransactionDate(createTransactionDTO.getEventDate());
            transactions.setTransactionNote(createTransactionDTO.getUserNote());
            transactions.setTransactionIsActive(true);
            transactions.setTransactionisApprove(false);
            transactions = transactionRepo.save(transactions);

            if(createTransactionDTO.getPackageName() != null){
                transactions.setPackages(packagesService.findByName(createTransactionDTO.getPackageName()));
            }

            transactions.setEvent(eventService.getEventByEventName(createTransactionDTO.getEventName()));
            transactions.setUser(userService.getUserByEmail(createTransactionDTO.getUserEmail()));
            transactionRepo.save(transactions);
            assignedEventService(createTransactionDTO.getServices(), transactions);
            return transactions;
        }catch(Exception e){
            throw new RuntimeException("Failed to create transaction: ", e);
        }
    }

    //connecting the transactions and the chosen services of subcontractors in event_service table;
    public List<SubcontractorEntity> assignedEventService(List<Integer> subcontractorServiceIds, TransactionsEntity transactions){
        List<SubcontractorEntity> subcontractors = new ArrayList<>();

        for(int subcontractorServiceId: subcontractorServiceIds){
            SubcontractorServiceEntity subcontractorServiceEntity = subcontractorServiceRepository.findById(subcontractorServiceId)
                .orElseThrow(() -> new RuntimeException("SubcontractorService with id " + subcontractorServiceId + " not found"));
            EventServiceEntity eventServiceEntity = new EventServiceEntity();
            eventServiceEntity.setTransactionsId(transactions);
            eventServiceEntity.setSubcontractorService(subcontractorServiceEntity);
            eventServiceService.create(eventServiceEntity);
            subcontractors.add(subcontractorServiceEntity.getSubcontractor());
        }
        return subcontractors;
    };

    @Transactional
    public TransactionsEntity validateTransaction(int id, String status, CreateBookingRejectionNoteDTO reason){
        TransactionsEntity transaction = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction with id " + id + " not found"));
        switch (status){
            case "APPROVED":
                    transaction.setTransactionStatus(TransactionsEntity.Status.ONGOING);
                    transaction.setTransactionisApprove(true);
                    // Create initial progress record when transaction is approved
                    try {
                        transactionProgressService.createInitialProgress(transaction);
                        // Also create initial subcontractor progress records
                        transactionProgressService.createInitialSubcontractorProgress(transaction);
                    } catch (Exception e) {
                        System.out.println("Warning: Failed to create progress records: " + e.getMessage());
                        // Continue even if progress creation fails
                    }
                    break;
            case "CANCELLED":
                    transaction.setTransactionStatus(TransactionsEntity.Status.CANCELLED);
                    transaction.setTransactionisApprove(false);
                    transaction.setTransactionIsActive(false);
//                    bookingRejectionNoteService.createRejectionNote(transaction, reason);
                    break;
            case "COMPLETED":
                    transaction.setTransactionStatus(TransactionsEntity.Status.COMPLETED);
                    transaction.setTransactionIsActive(false);
                    break;
            case "DECLINED":
                    transaction.setTransactionStatus(TransactionsEntity.Status.DECLINED);
                    transaction.setTransactionisApprove(false);
                    bookingRejectionNoteService.createRejectionNote(transaction, reason);
                    break;
            default:
                    throw new RuntimeException("Invalid transaction status: " + status);
        }
        return transactionRepo.save(transaction);
    }

    // Get transaction by ID
    public TransactionsEntity getById(int id) {
        return transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction with id " + id + " not found"));
    }

    // Get all transactions.findAll();
    public List<GetTransactionDTO> getAllPendingTransactions() {
        System.out.println("=== GETTING ALL PENDING TRANSACTIONS ===");
        List<TransactionsEntity> existingTransactions = transactionRepo.findByTransactionStatusAndIsActive(TransactionsEntity.Status.PENDING, true);
        System.out.println("Found " + existingTransactions.size() + " pending transactions");

        // Also check for inactive pending transactions for debugging
        List<TransactionsEntity> inactivePending = transactionRepo.findByTransactionStatusAndIsActive(TransactionsEntity.Status.PENDING, false);
        System.out.println("Found " + inactivePending.size() + " inactive pending transactions");

        List<GetTransactionDTO> result = new ArrayList<>();

        for(TransactionsEntity transaction : existingTransactions){
            try {
                GetTransactionDTO getTransactionDTO = new GetTransactionDTO();
                getTransactionDTO.setTransaction_Id(transaction.getTransaction_Id());

                // Add null checks for user
                if (transaction.getUser() != null) {
                    getTransactionDTO.setUserEmail(transaction.getUser().getEmail());
                    getTransactionDTO.setUserName(transaction.getUser().getFirstname() + " " + transaction.getUser().getLastname());
                    getTransactionDTO.setPhoneNumber(transaction.getUser().getPhoneNumber());
                    getTransactionDTO.setUserAddress(transaction.getUser().getProvince() + " " + transaction.getUser().getBarangay());
                }

                // Handle event vs package logic with null checks
                if (transaction.getEventServices() != null && transaction.getEvent() != null) {
                    getTransactionDTO.setEventName(transaction.getEvent().getEvent_name());
                    getTransactionDTO.setSubcontractors(getSubcontractorsOfEvent(transaction.getEventServices()));
                } else if (transaction.getPackages() != null) {
                    List<SubcontractorEntity> subcontractor = subcontractorService.getSubcontractorByPackageName(transaction.getPackages().getPackageName());
                    getTransactionDTO.setPackages(transaction.getPackages().getPackageName());
                    getTransactionDTO.setSubcontractors(getSubcontractorsOfPackages(subcontractor));
                }

                getTransactionDTO.setTransactionVenue(transaction.getTransactionVenue());
                getTransactionDTO.setTransactionStatus(transaction.getTransactionStatus().toString());
                getTransactionDTO.setTransactionDate(transaction.getTransactionDate());
                getTransactionDTO.setTransactionNote(transaction.getTransactionNote());
                getTransactionDTO.setPayment(transaction.getPayment());

                result.add(getTransactionDTO);
            } catch (Exception e) {
                System.out.println("Error processing transaction " + transaction.getTransaction_Id() + ": " + e.getMessage());
            }
        }
        return result;
    }

    //helper function for the eventService entity
    private List<Map<String, Object>>  getSubcontractorsOfEvent(List<EventServiceEntity> eventServices){
       return eventServices.stream()
               .filter(eventService -> eventService.getSubcontractorService() != null) // Filter out null subcontractor services
               .map(eventService -> {
                   SubcontractorServiceEntity subcontractorServiceEntity = eventService.getSubcontractorService();
                   SubcontractorEntity subcontractor = subcontractorServiceEntity.getSubcontractor();

                   Map<String, Object> subcontractorDetails = new HashMap<>();
                   subcontractorDetails.put("subcontractorUserId", subcontractor.getUser() != null ? subcontractor.getUser().getUserId() : 0);
                   subcontractorDetails.put("subcontractorEntityId", subcontractor.getSubcontractor_Id()); // Add the correct subcontractor entity ID
                   subcontractorDetails.put("subcontractorName", subcontractor.getUser() != null ?
                       subcontractor.getUser().getFirstname() + " " + subcontractor.getUser().getLastname() :
                       subcontractor.getSubcontractor_serviceName());
                   subcontractorDetails.put("subcontractorEmail", subcontractor.getUser() != null ? subcontractor.getUser().getEmail() : "N/A");
                   subcontractorDetails.put("serviceName", subcontractorServiceEntity.getName());
                   subcontractorDetails.put("serviceCategory", ""); // No serviceCategory field in SubcontractorServiceEntity
                   subcontractorDetails.put("eventServiceId", eventService.getEventServices_id()); // Add the event service ID for unique identification
                   //add the category here
                   return subcontractorDetails;
               })
               .collect(Collectors.toList());
    }

    //helper function for the eventService entity
    private List<Map<String, Object>>  getSubcontractorsOfPackages(List<SubcontractorEntity> subcontractors){
        return subcontractors.stream().map(
                subcontractor -> {
                    Map<String, Object> subcontractorDetails = new HashMap<>();
                    subcontractorDetails.put("subcontractorUserId", subcontractor.getUser() != null ? subcontractor.getUser().getUserId() : 0);
                    subcontractorDetails.put("subcontractorEntityId", subcontractor.getSubcontractor_Id()); // Add the correct subcontractor entity ID
                    subcontractorDetails.put("subcontractorName", subcontractor.getUser() != null ?
                        subcontractor.getUser().getFirstname() + " " + subcontractor.getUser().getLastname() :
                        subcontractor.getSubcontractor_serviceName());
                    subcontractorDetails.put("subcontractorEmail", subcontractor.getUser() != null ? subcontractor.getUser().getEmail() : "N/A");
                    subcontractorDetails.put("serviceName", subcontractor.getSubcontractor_serviceName());
                    subcontractorDetails.put("serviceCategory", subcontractor.getSubcontractor_serviceCategory());

                    return subcontractorDetails;
                }).toList();
    }

    public List<GetTransactionDTO>getAllTransactions() {
        List<TransactionsEntity> existingTransactions = transactionRepo.findAll();
        List<GetTransactionDTO> result = new ArrayList<>();

        for(TransactionsEntity transaction : existingTransactions){
            GetTransactionDTO getTransactionDTO = new GetTransactionDTO();
            getTransactionDTO.setTransaction_Id(transaction.getTransaction_Id());
            getTransactionDTO.setUserEmail(transaction.getUser().getEmail());
            getTransactionDTO.setUserName(transaction.getUser().getFirstname() + " " + transaction.getUser().getLastname());
            getTransactionDTO.setPhoneNumber(transaction.getUser().getPhoneNumber());
            getTransactionDTO.setUserAddress(transaction.getUser().getProvince() + " " + transaction.getUser().getBarangay());

            //true if its a custom
            if (transaction.getEventServices() != null && transaction.getEvent() != null) {
                System.out.println("EVENT SERVICES: " + transaction.getEventServices().size());
                System.out.println("EVENT: " + transaction.getEvent().getEvent_name());
                getTransactionDTO.setEventName(transaction.getEvent().getEvent_name());
                getTransactionDTO.setSubcontractors(getSubcontractorsOfEvent(transaction.getEventServices()));
            }else{
                List<SubcontractorEntity> subcontractor = subcontractorService.getSubcontractorByPackageName(transaction.getPackages().getPackageName());
                System.out.println("SUBCONTRACTORS: " + subcontractor.size());
                getTransactionDTO.setPackages(transaction.getPackages().getPackageName());
                getTransactionDTO.setSubcontractors(getSubcontractorsOfPackages(subcontractor));
            }

            //if transaction is declined get the reason
            if(transaction.getRejection() != null){
                RejectNoteDTO rejectNoteDTO = new RejectNoteDTO();
                rejectNoteDTO.setRejectionNote(transaction.getRejection().getRejectionNote());
                rejectNoteDTO.setRejectedDate(transaction.getRejection().getRejectedDate());
                rejectNoteDTO.setImageUrl(transaction.getRejection().getImageUrl());
                getTransactionDTO.setRejectedNote(rejectNoteDTO);
            }

            getTransactionDTO.setTransactionVenue(transaction.getTransactionVenue());
            getTransactionDTO.setTransactionStatus(transaction.getTransactionStatus().toString());
            getTransactionDTO.setTransactionDate(transaction.getTransactionDate());
            getTransactionDTO.setTransactionNote(transaction.getTransactionNote());
            getTransactionDTO.setPayment(transaction.getPayment());

            result.add(getTransactionDTO);
        }
        return result;
    }

    public List<TransactionUserEventAndPackageDTO> findAllJoinedWithUserAndEventAndPackages() {
        List<TransactionUserEventAndPackageDTO> existingTransactions = transactionRepo.findAllJoinedWithUserAndEventAndPackages();
        return existingTransactions;
    }

    //revise this, it must accomodate the subcontactors of packages
    public TransactionPaymentAndSubcontractorsDTO findAllJoinedWIthPaymentAndSubcontractorsByTransactionId(int transactionId) {
        TransactionPaymentAndSubcontractorsDTO existingTransactions = transactionRepo.findAllJoinedWIthPaymentAndSubcontractorsByTransactionId(transactionId);
        existingTransactions.setSubcontractors(getSubcontractorsOfEvent(eventServiceService.getByTransactionId(transactionId)));
        return existingTransactions;
    }

    // Delete transaction
    public void delete(int id) {
        if (!transactionRepo.existsById(id)) {
            throw new RuntimeException("Transaction with id " + id + " not found");
        }
        transactionRepo.deleteById(id);
    }

    // Get transactions by event ID
    public List<TransactionsEntity> getByEventId(int eventId) {
        return transactionRepo.findByEventEntityId(eventId);
    }
    
    // Get transactions by status
    public List<TransactionsEntity> getByStatus(String status) {
        return transactionRepo.findByTransactionStatusAndIsActive(TransactionsEntity.Status.valueOf(status), true);
    }

    // MODIFIED METHOD - Solution 1 Implementation
    @Transactional
    public TransactionsEntity createBookingTransaction(BookingTransactionDTO bookingData, MultipartFile paymentProof) throws IOException {
        
        System.out.println("=== TRANSACTION SERVICE DEBUG ===");
        System.out.println("Looking for user with email: " + bookingData.getUserEmail());
        
        try {
            // 1. Find the user by email
            UserEntity user = userRepository.findByEmail(bookingData.getUserEmail());
            if (user == null) {
                System.out.println("ERROR: User not found with email: " + bookingData.getUserEmail());
                throw new RuntimeException("User not found with email: " + bookingData.getUserEmail());
            }
            System.out.println("Found user: " + user.getFirstname() + " " + user.getLastname());
            
            // 2. Find the event by ID
            System.out.println("Looking for event with ID: " + bookingData.getEventId());
            EventEntity event = eventRepository.findById(bookingData.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + bookingData.getEventId()));
            System.out.println("Found event: " + event.getEvent_name());
            
            // 3. Validate that it's either package OR custom services, not both
            boolean hasPackage = "PACKAGE".equals(bookingData.getServiceType()) && bookingData.getPackageId() != null;
            boolean hasCustomServices = "CUSTOM".equals(bookingData.getServiceType()) && 
                                    bookingData.getServiceIds() != null && 
                                    !bookingData.getServiceIds().isEmpty();
            
            System.out.println("Has package: " + hasPackage);
            System.out.println("Has custom services: " + hasCustomServices);
            
            if (hasPackage && hasCustomServices) {
                throw new RuntimeException("Cannot have both package and custom services in the same booking");
            }
            
            if (!hasPackage && !hasCustomServices) {
                throw new RuntimeException("Must select either a package or custom services");
            }
            
            // 4. Upload payment proof to S3
            String paymentReceiptUrl = null;
            if (paymentProof != null && !paymentProof.isEmpty()) {
                System.out.println("Attempting to upload payment proof to S3...");
                try {
                    File convFile = File.createTempFile("payment_proof", paymentProof.getOriginalFilename());
                    paymentProof.transferTo(convFile);
                    paymentReceiptUrl = s3Service.upload(convFile, "payment_proofs", paymentProof.getOriginalFilename());
                    convFile.delete();
                    System.out.println("Payment proof uploaded successfully: " + paymentReceiptUrl);
                } catch (Exception e) {
                    System.out.println("ERROR: S3 upload failed: " + e.getMessage());
                    throw e;
                }
            }
            
            // 5. Create Transaction (without payment initially)
            System.out.println("Creating transaction...");
            TransactionsEntity transaction = new TransactionsEntity();
            transaction.setUser(user);
            transaction.setEvent(event);
            transaction.setTransactionVenue(bookingData.getTransactionVenue());
            transaction.setTransactionDate(bookingData.getTransactionDate());
            transaction.setTransactionNote(bookingData.getTransactionNote());
            transaction.setTransactionStatus(TransactionsEntity.Status.PENDING);
            transaction.setTransactionIsActive(true);
            transaction.setTransactionisApprove(false);
            

            transaction.setPayment(null);
            
            // 6. Handle Package OR Custom Services (mutually exclusive)
            if (hasPackage) {
                System.out.println("Processing package booking...");
                PackagesEntity packageEntity = packageRepository.findById(bookingData.getPackageId())
                    .orElseThrow(() -> new RuntimeException("Package not found with ID: " + bookingData.getPackageId()));
                transaction.setPackages(packageEntity);
                transaction.setEventServices(null);
                System.out.println("Package set: " + packageEntity.getPackageName());
                
            } else if (hasCustomServices) {
                System.out.println("Processing custom services booking...");
                transaction.setPackages(null);
                // EventServices will be created after transaction is saved
            }
            
            // 7. Save transaction first (without payment)
            System.out.println("Saving transaction (without payment)...");
            TransactionsEntity savedTransaction = transactionRepo.save(transaction);
            System.out.println("Transaction saved with ID: " + savedTransaction.getTransaction_Id());
            
            // 8. Handle custom services after transaction is saved
            if (hasCustomServices) {
                System.out.println("Creating EventService records...");
                List<EventServiceEntity> eventServices = new ArrayList<>();
                for (int serviceId : bookingData.getServiceIds()) {
                    System.out.println("Creating EventService for service ID: " + serviceId);
                    EventServiceEntity eventService = new EventServiceEntity();
                    eventService.setTransactionsId(savedTransaction);

                    // Try to find the subcontractor service by ID
                    try {
                        SubcontractorServiceEntity subcontractorServiceEntity = subcontractorServiceRepository.findById(serviceId)
                            .orElseThrow(() -> new RuntimeException("SubcontractorService with id " + serviceId + " not found"));
                        eventService.setSubcontractorService(subcontractorServiceEntity);
                        System.out.println("Assigned subcontractor service: " + subcontractorServiceEntity.getName());
                    } catch (Exception e) {
                        System.out.println("WARNING: SubcontractorService not found for ID " + serviceId + ", will be assigned later by admin");
                        eventService.setSubcontractorService(null); // Will be assigned later by admin
                    }

                    eventServices.add(eventService);
                }

                // Save the EventService records
                eventServices = EventServiceRepository.saveAll(eventServices);
                savedTransaction.setEventServices(eventServices);
                System.out.println("Created " + eventServices.size() + " event services");
            }
            
            // 9. Create and save payment separately
            System.out.println("Creating payment record...");
            PaymentEntity payment = new PaymentEntity();
            payment.setTransaction(savedTransaction);  // Set the saved transaction
            payment.setPaymentReceipt(paymentReceiptUrl);
            payment.setPaymentNote(bookingData.getPaymentNote());

            try {
                payment.setPaymentReferenceNumber(Integer.parseInt(bookingData.getPaymentReferenceNumber()));
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid payment reference number format: " + bookingData.getPaymentReferenceNumber());
            }
            
            // Save payment separately
            System.out.println("Saving payment...");
            PaymentEntity savedPayment = paymentRepository.save(payment);
            System.out.println("Payment saved with ID: " + savedPayment.getPaymentId());
            
            // 10. Update transaction with saved payment
            System.out.println("Updating transaction with payment...");
            savedTransaction.setPayment(savedPayment);
            savedTransaction = transactionRepo.save(savedTransaction);
            
            System.out.println("Transaction completed successfully with ID: " + savedTransaction.getTransaction_Id());
            return savedTransaction;
            
        } catch (Exception e) {
            System.out.println("ERROR: Exception in createBookingTransaction: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create booking transaction: " + e.getMessage(), e);
        }
    }

    public List<TransactionsEntity> getReservationsByUserId(int userId) {
        return transactionRepo.findByUserId(userId);
    }

    public List<GetTransactionDTO> getEventServicesByEmail(String email) {
        List<TransactionsEntity> transactions = transactionRepo.getAllTransactionsByEventService(email);
        return transactions.stream().filter(t -> !t.getTransactionStatus().equals(TransactionsEntity.Status.PENDING) && !t.getTransactionStatus().equals(TransactionsEntity.Status.CANCELLED) && !t.getTransactionStatus().equals(TransactionsEntity.Status.DECLINED))
            .map(GetTransactionDTO::new)
            .collect(Collectors.toList());
    }
    

    //new function for user transactions - Ivan
    public List<GetTransactionDTO> getAllTransactionsByUserEmail(String email) {
        System.out.println("Fetching transactions for user with email: " + email);
        List<TransactionsEntity> transactions = transactionRepo.findByUserEmail(email);
        System.out.println("Found " + transactions.size() + " transactions for user");
        
        // Convert to DTOs with all status types (don't filter by status)
        List<GetTransactionDTO> result = new ArrayList<>();

        for(TransactionsEntity transaction : transactions){
            GetTransactionDTO getTransactionDTO = new GetTransactionDTO();
            getTransactionDTO.setTransaction_Id(transaction.getTransaction_Id());
            getTransactionDTO.setUserEmail(transaction.getUser().getEmail());
            getTransactionDTO.setUserName(transaction.getUser().getFirstname() + " " + transaction.getUser().getLastname());
            getTransactionDTO.setPhoneNumber(transaction.getUser().getPhoneNumber());
            getTransactionDTO.setUserAddress(transaction.getUser().getProvince() + " " + transaction.getUser().getBarangay());

            //true if its a custom
            if (transaction.getEventServices() != null && transaction.getEvent() != null) {
                getTransactionDTO.setEventName(transaction.getEvent().getEvent_name());
                getTransactionDTO.setSubcontractors(getSubcontractorsOfEvent(transaction.getEventServices()));
            }else if (transaction.getPackages() != null) {
                List<SubcontractorEntity> subcontractor = subcontractorService.getSubcontractorByPackageName(transaction.getPackages().getPackageName());
                getTransactionDTO.setPackages(transaction.getPackages().getPackageName());
                getTransactionDTO.setSubcontractors(getSubcontractorsOfPackages(subcontractor));
            }

            getTransactionDTO.setTransactionVenue(transaction.getTransactionVenue());
            getTransactionDTO.setTransactionStatus(transaction.getTransactionStatus().toString());
            getTransactionDTO.setTransactionDate(transaction.getTransactionDate());
            getTransactionDTO.setTransactionNote(transaction.getTransactionNote());
            getTransactionDTO.setPayment(transaction.getPayment());

            result.add(getTransactionDTO);
        }
        return result;
    }
        @Transactional
    public TransactionsEntity createPackageBooking(PackageBookingDTO packageBookingData, MultipartFile paymentProof) throws IOException {

        System.out.println("=== PACKAGE BOOKING SERVICE DEBUG ===");

        try {
            // 1. Find the user by email
            UserEntity user = userRepository.findByEmail(packageBookingData.getUserEmail());
            if (user == null) {
                System.out.println("ERROR: User not found with email: " + packageBookingData.getUserEmail());
                throw new RuntimeException("User not found with email: " + packageBookingData.getUserEmail());
            }
            System.out.println("Found user: " + user.getFirstname() + " " + user.getLastname());

            // // 2. Find the event by ID
            // System.out.println("Looking for event with ID: " + packageBookingData.getEventId());
            // EventEntity event = eventRepository.findById(packageBookingData.getEventId())
            //     .orElseThrow(() -> new RuntimeException("Event not found with ID: " + packageBookingData.getEventId()));
            // System.out.println("Found event: " + event.getEvent_name());

            // 3. Find the package by ID
            System.out.println("Looking for package with ID: " + packageBookingData.getPackageId());
            PackagesEntity packageEntity = packageRepository.findById(packageBookingData.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found with ID: " + packageBookingData.getPackageId()));
            System.out.println("Found package: " + packageEntity.getPackageName());

            // 4. Upload payment proof to S3
            String paymentReceiptUrl = null;
            if (paymentProof != null && !paymentProof.isEmpty()) {
                System.out.println("Attempting to upload payment proof to S3...");
                try {
                    File convFile = File.createTempFile("payment_proof_package", paymentProof.getOriginalFilename());
                    paymentProof.transferTo(convFile);
                    paymentReceiptUrl = s3Service.upload(convFile, "payment_proofs/packages", paymentProof.getOriginalFilename());
                    convFile.delete();
                    System.out.println("Payment proof uploaded successfully: " + paymentReceiptUrl);
                } catch (Exception e) {
                    System.out.println("ERROR: S3 upload failed: " + e.getMessage());
                    throw e;
                }
            }

            // 5. Create Transaction for Package Booking
            System.out.println("Creating package transaction...");
            TransactionsEntity transaction = new TransactionsEntity();
            transaction.setUser(user);
            transaction.setPackages(packageEntity); // Set the package
            transaction.setEventServices(null); // No custom services for package bookings
            transaction.setTransactionVenue(packageBookingData.getTransactionVenue());
            transaction.setTransactionDate(packageBookingData.getTransactionDate());
            transaction.setTransactionNote(packageBookingData.getTransactionNote());
            transaction.setTransactionStatus(TransactionsEntity.Status.PENDING);
            transaction.setTransactionIsActive(true);
            transaction.setTransactionisApprove(false);

            // Save transaction first (without payment)
            System.out.println("Saving package transaction...");
            TransactionsEntity savedTransaction = transactionRepo.save(transaction);
            System.out.println("Package transaction saved with ID: " + savedTransaction.getTransaction_Id());

            // 6. Create and save payment
            System.out.println("Creating payment record for package booking...");
            PaymentEntity payment = new PaymentEntity();
            payment.setTransaction(savedTransaction);
            payment.setPaymentReceipt(paymentReceiptUrl);
            payment.setPaymentNote(packageBookingData.getPaymentNote() != null ?
                packageBookingData.getPaymentNote() :
                "Payment for " + packageEntity.getPackageName() + " package booking");

            try {
                payment.setPaymentReferenceNumber(Integer.parseInt(packageBookingData.getPaymentReferenceNumber()));
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid payment reference number format: " + packageBookingData.getPaymentReferenceNumber());
            }

            // Save payment
            System.out.println("Saving payment for package booking...");
            PaymentEntity savedPayment = paymentRepository.save(payment);
            System.out.println("Payment saved with ID: " + savedPayment.getPaymentId());

            // 7. Update transaction with payment
            System.out.println("Updating package transaction with payment...");
            savedTransaction.setPayment(savedPayment);
            savedTransaction = transactionRepo.save(savedTransaction);

            System.out.println("Package booking completed successfully with ID: " + savedTransaction.getTransaction_Id());
            return savedTransaction;

        } catch (Exception e) {
            System.out.println("ERROR: Exception in createPackageBooking: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create package booking: " + e.getMessage(), e);
        }
    }

    public TransactionsEntity getPackageBookingById(int transactionId) {
        TransactionsEntity transaction = transactionRepo.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Package booking not found with ID: " + transactionId));

        if (transaction.getPackages() == null) {
            throw new RuntimeException("Transaction with ID " + transactionId + " is not a package booking");
        }

        return transaction;
    }

    public List<TransactionsEntity> getUserPackageBookings(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found with email: " + userEmail);
        }

        List<TransactionsEntity> userTransactions = transactionRepo.findByUserId(user.getUserId());

        // Filter only package bookings (transactions that have a package)
        return userTransactions.stream()
                .filter(transaction -> transaction.getPackages() != null)
                .collect(Collectors.toList());
    }

    public List<TransactionsEntity> getAllPackageBookings() {
        List<TransactionsEntity> allTransactions = transactionRepo.findAll();

        // Filter only package bookings
        return allTransactions.stream()
                .filter(transaction -> transaction.getPackages() != null)
                .collect(Collectors.toList());
    }

    public List<TransactionsEntity> getPackageBookingsByStatus(TransactionsEntity.Status status) {
        List<TransactionsEntity> transactionsByStatus = transactionRepo.findByTransactionStatusAndIsActive(status, true);

        // Filter only package bookings
        return transactionsByStatus.stream()
                .filter(transaction -> transaction.getPackages() != null)
                .collect(Collectors.toList());
    }

    public TransactionsEntity updatePackageBookingStatus(int transactionId, String status) {
        TransactionsEntity transaction = getPackageBookingById(transactionId);

        switch (status.toUpperCase()) {
            case "APPROVED":
                transaction.setTransactionStatus(TransactionsEntity.Status.ONGOING);
                transaction.setTransactionisApprove(true);
                // Create initial progress record when transaction is approved
                try {
                    transactionProgressService.createInitialProgress(transaction);
                    // Also create initial subcontractor progress records
                    transactionProgressService.createInitialSubcontractorProgress(transaction);
                } catch (Exception e) {
                    System.out.println("Warning: Failed to create progress records: " + e.getMessage());
                    // Continue even if progress creation fails
                }
                break;
            case "CANCELLED":
                transaction.setTransactionStatus(TransactionsEntity.Status.CANCELLED);
                transaction.setTransactionisApprove(false);
                break;
            case "COMPLETED":
                transaction.setTransactionStatus(TransactionsEntity.Status.COMPLETED);
                break;
            case "DECLINED":
                transaction.setTransactionStatus(TransactionsEntity.Status.DECLINED);
                transaction.setTransactionisApprove(false);
                break;
            default:
                throw new RuntimeException("Invalid package booking status: " + status);
        }

        return transactionRepo.save(transaction);
    }


    public List<Map<String, Object>> getAllTransactionsDates() {
        List<TransactionsEntity> transactions = transactionRepo.findAll();
        return transactions.stream()
                .filter(t -> t.getTransactionIsActive() &&
                        (t.getTransactionStatus() == TransactionsEntity.Status.ONGOING ||
                                t.getTransactionStatus() == TransactionsEntity.Status.PENDING))
                .map(t -> {
                    Map<String, Object> transactionData = new HashMap<>();
                    transactionData.put("transactionId", t.getTransaction_Id());
                    transactionData.put("transactionDate", t.getTransactionDate());
                    return transactionData;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get all transactions assigned to a subcontractor
     */
    public List<Map<String, Object>> getTransactionsBySubcontractorId(int subcontractorId) {
        System.out.println("Getting transactions for subcontractor ID: " + subcontractorId);

        // Get all transactions where this subcontractor is assigned
        List<TransactionsEntity> transactions = transactionRepo.findTransactionsBySubcontractorId(subcontractorId);

        System.out.println("Found " + transactions.size() + " transactions for subcontractor");

        return transactions.stream()
                .filter(t -> t.getTransactionIsActive() &&
                        (t.getTransactionStatus() == TransactionsEntity.Status.ONGOING))
                .map(t -> {
                    Map<String, Object> transactionData = new HashMap<>();
                    transactionData.put("transactionId", t.getTransaction_Id());
                    transactionData.put("eventName", t.getEvent() != null ? t.getEvent().getEvent_name() :
                                                     (t.getPackages() != null ? t.getPackages().getPackageName() : "Unknown Event"));
                    transactionData.put("location", t.getTransactionVenue());
                    transactionData.put("startDate", t.getTransactionDate());
                    transactionData.put("status", t.getTransactionStatus().toString());
                    transactionData.put("progressPercentage", 0); // Will be updated from progress service
                    transactionData.put("checkInStatus", "PENDING"); // Will be updated from progress service
                    transactionData.put("lastUpdate", null); // Will be updated from progress service
                    return transactionData;
                })
                .collect(Collectors.toList());
    }
}