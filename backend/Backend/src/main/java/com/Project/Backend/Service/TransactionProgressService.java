package com.Project.Backend.Service;

import com.Project.Backend.Entity.TransactionProgressEntity;
import com.Project.Backend.Entity.TransactionsEntity;
import com.Project.Backend.Entity.SubcontractorProgressEntity;
import com.Project.Backend.Entity.SubcontractorEntity;
import com.Project.Backend.Entity.SubcontractorServiceEntity;
import com.Project.Backend.Entity.EventServiceEntity;
import com.Project.Backend.Repository.TransactionProgressRepository;
import com.Project.Backend.Repository.SubcontractorProgressRepository;
import com.Project.Backend.Repository.SubContractorRepository;
import com.Project.Backend.Repository.EventServiceRepository;
import com.Project.Backend.Repository.TransactionRepo;
import com.Project.Backend.DTO.SubcontractorProgressDTO;
import com.Project.Backend.DTO.EventProgressDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransactionProgressService {

    @Autowired
    private TransactionProgressRepository transactionProgressRepository;

    @Autowired
    private SubcontractorProgressRepository subcontractorProgressRepository;

    @Autowired
    private SubContractorRepository subContractorRepository;

    @Autowired
    private EventServiceRepository eventServiceRepository;

    @Autowired
    private TransactionRepo transactionRepo;

    /**
     * Create initial progress record when transaction is created
     */
    public TransactionProgressEntity createInitialProgress(TransactionsEntity transaction) {
        // Check if progress already exists
        if (transactionProgressRepository.existsByTransactionId(transaction.getTransaction_Id())) {
            throw new RuntimeException("Progress already exists for transaction ID: " + transaction.getTransaction_Id());
        }

        TransactionProgressEntity progress = new TransactionProgressEntity(
            transaction,
            0, // Initial progress is 0%
            "Transaction created and payment proof submitted"
        );

        return transactionProgressRepository.save(progress);
    }

    /**
     * Update progress for a transaction
     */
    public TransactionProgressEntity updateProgress(int transactionId, int newProgress, String note) {
        Optional<TransactionProgressEntity> existingProgress = 
            transactionProgressRepository.findByTransactionId(transactionId);

        if (existingProgress.isEmpty()) {
            throw new RuntimeException("Progress not found for transaction ID: " + transactionId);
        }

        TransactionProgressEntity progress = existingProgress.get();
        progress.setCurrentProgress(Math.max(0, Math.min(100, newProgress))); // Ensure 0-100 range
        if (note != null && !note.trim().isEmpty()) {
            progress.setProgressNote(note);
        }

        // Also update the progress field in the transaction entity
        TransactionsEntity transaction = progress.getTransaction();
        transaction.setProgress(progress.getCurrentProgress());

        return transactionProgressRepository.save(progress);
    }

    /**
     * Get progress by transaction ID
     */
    public Optional<TransactionProgressEntity> getProgressByTransactionId(int transactionId) {
        return transactionProgressRepository.findByTransactionId(transactionId);
    }

    /**
     * Get all progress records for a user
     */
    public List<TransactionProgressEntity> getProgressByUserEmail(String userEmail) {
        return transactionProgressRepository.findByUserEmail(userEmail);
    }

    /**
     * Get progress records by status
     */
    public List<TransactionProgressEntity> getProgressByStatus(TransactionProgressEntity.ProgressStatus status) {
        return transactionProgressRepository.findByStatus(status);
    }

    /**
     * Mark transaction as payment received (25% progress)
     */
    public TransactionProgressEntity markPaymentReceived(int transactionId) {
        return updateProgress(transactionId, 25, "Payment confirmed and verified");
    }

    /**
     * Mark transaction as planning phase (50% progress)
     */
    public TransactionProgressEntity markPlanningPhase(int transactionId) {
        return updateProgress(transactionId, 50, "Event planning in progress");
    }

    /**
     * Mark transaction as preparation phase (75% progress)
     */
    public TransactionProgressEntity markPreparationPhase(int transactionId) {
        return updateProgress(transactionId, 75, "Event preparation underway");
    }

    /**
     * Mark transaction as completed (100% progress)
     */
    public TransactionProgressEntity markCompleted(int transactionId) {
        return updateProgress(transactionId, 100, "Event completed successfully");
    }

    /**
     * Get all progress records
     */
    public List<TransactionProgressEntity> getAllProgress() {
        return transactionProgressRepository.findAll();
    }

    /**
     * Delete progress record
     */
    public void deleteProgress(int progressId) {
        transactionProgressRepository.deleteById(progressId);
    }

    /**
     * Get progress history for a transaction
     */
    public List<TransactionProgressEntity> getProgressHistory(int transactionId) {
        // This would typically return all progress records for a transaction
        // For now, we'll return the current progress record as a single-item list
        Optional<TransactionProgressEntity> progress = transactionProgressRepository.findByTransactionId(transactionId);
        if (progress.isPresent()) {
            return List.of(progress.get());
        }
        throw new RuntimeException("Progress history not found for transaction ID: " + transactionId);
    }

    // ==================== SUBCONTRACTOR PROGRESS METHODS ====================

    /**
     * Create initial subcontractor progress records for a transaction
     */
    public void createInitialSubcontractorProgress(TransactionsEntity transaction) {
        // Get all subcontractors assigned to this transaction
        List<EventServiceEntity> eventServices = eventServiceRepository.findByTransactionId(transaction.getTransaction_Id());

        for (EventServiceEntity eventService : eventServices) {
            SubcontractorServiceEntity subcontractorService = eventService.getSubcontractorService();
            if (subcontractorService != null) {
                SubcontractorEntity subcontractor = subcontractorService.getSubcontractor();
                // Check if progress already exists
                Optional<SubcontractorProgressEntity> existingProgress =
                    subcontractorProgressRepository.findByTransactionIdAndSubcontractorId(
                        transaction.getTransaction_Id(), subcontractor.getSubcontractor_Id());

                if (existingProgress.isEmpty()) {
                    SubcontractorProgressEntity progress = new SubcontractorProgressEntity(
                        // Need to get TransactionProgressEntity for this transaction
                        transactionProgressRepository.findByTransactionId(transaction.getTransaction_Id())
                            .orElseThrow(() -> new RuntimeException("TransactionProgress not found for transaction ID: " + transaction.getTransaction_Id())),
                        subcontractor,
                        0, // Initial progress is 0%
                        "Subcontractor assigned to event"
                    );
                    subcontractorProgressRepository.save(progress);
                }
            }
        }
    }

    /**
     * Update subcontractor progress
     */
    public SubcontractorProgressEntity updateSubcontractorProgress(int transactionId, int subcontractorId,
                                                                 int progressPercentage, String checkInStatus, String notes, String imageUrlsJson, String comment) {
        Optional<SubcontractorProgressEntity> existingProgress =
            subcontractorProgressRepository.findByTransactionIdAndSubcontractorId(transactionId, subcontractorId);

        if (existingProgress.isEmpty()) {
            throw new RuntimeException("Subcontractor progress not found for transaction ID: " + transactionId +
                                     " and subcontractor ID: " + subcontractorId);
        }

        SubcontractorProgressEntity progress = existingProgress.get();
        progress.setProgressPercentage(Math.max(0, Math.min(100, progressPercentage)));

        if (checkInStatus != null) {
            try {
                progress.setCheckInStatus(SubcontractorProgressEntity.CheckInStatus.valueOf(checkInStatus.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid check-in status: " + checkInStatus);
            }
        }

        if (notes != null && !notes.trim().isEmpty()) {
            progress.setProgressNotes(notes);
        }

        if (imageUrlsJson != null && !imageUrlsJson.trim().isEmpty()) {
            progress.setProgressImageUrl(imageUrlsJson);
        }

        if (comment != null && !comment.trim().isEmpty()) {
            progress.setComment(comment);
        }

        SubcontractorProgressEntity savedProgress = subcontractorProgressRepository.save(progress);

        // Check if all subcontractors are approved and update transaction status if needed
        checkAndUpdateTransactionStatus(transactionId);

        return savedProgress;
    }

    /**
     * Get all subcontractor progress for a transaction
     */
    public List<SubcontractorProgressEntity> getSubcontractorProgressByTransactionId(int transactionId) {
        return subcontractorProgressRepository.findByTransactionId(transactionId);
    }

    /**
     * Get subcontractor progress as DTOs for a transaction
     */
    public List<SubcontractorProgressDTO> getSubcontractorProgressDTOs(int transactionId) {
        List<SubcontractorProgressEntity> progressEntities = getSubcontractorProgressByTransactionId(transactionId);

        return progressEntities.stream()
            .map(entity -> new SubcontractorProgressDTO(
                entity.getSubcontractorProgressId(),
                entity.getTransactionProgress().getTransaction().getTransaction_Id(),
                entity.getSubcontractor().getSubcontractor_Id(),
                entity.getSubcontractor().getUser() != null ?
                    entity.getSubcontractor().getUser().getUserId() : 0,
                entity.getSubcontractor().getSubcontractor_serviceName(),
                entity.getSubcontractor().getSubcontractor_serviceCategory(),
                entity.getSubcontractor().getUser() != null ?
                    entity.getSubcontractor().getUser().getProfilePicture() : null,
                entity.getProgressPercentage(),
                entity.getCheckInStatus().toString(),
                entity.getProgressNotes(),
                entity.getProgressImageUrl(),
                entity.getComment(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
            ))
            .collect(Collectors.toList());
    }

    /**
     * Get event progress with subcontractors
     */
    public EventProgressDTO getEventProgress(int transactionId) {
        // Get transaction details
        Optional<TransactionsEntity> transactionOpt = transactionRepo.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new RuntimeException("Transaction not found for ID: " + transactionId);
        }
        TransactionsEntity transaction = transactionOpt.get();

        // Get subcontractor progress
        List<SubcontractorProgressDTO> subcontractorProgress = getSubcontractorProgressDTOs(transactionId);

        // Calculate overall progress
        int overallProgress = subcontractorProgress.isEmpty() ? 0 :
            subcontractorProgress.stream()
                .mapToInt(SubcontractorProgressDTO::getProgressPercentage)
                .sum() / subcontractorProgress.size();

        // Determine overall check-in status
        String overallCheckInStatus = "pending";
        if (!subcontractorProgress.isEmpty()) {
            boolean hasRejected = subcontractorProgress.stream()
                .anyMatch(sp -> "REJECTED".equals(sp.getCheckInStatus()));
            boolean allApproved = subcontractorProgress.stream()
                .allMatch(sp -> "APPROVED".equals(sp.getCheckInStatus()));

            if (hasRejected) {
                overallCheckInStatus = "rejected";
            } else if (allApproved) {
                overallCheckInStatus = "completed";
            } else {
                overallCheckInStatus = "pending";
            }
        }

        // Map transaction status to frontend status
        String currentStatus = mapTransactionStatusToFrontend(transaction.getTransactionStatus());

        return new EventProgressDTO(
            transactionId,
            transaction.getEvent() != null ? transaction.getEvent().getEvent_name() : "Event " + transactionId,
            transaction.getTransactionVenue() != null ? transaction.getTransactionVenue() : "Location TBD",
            transaction.getTransactionDate() != null ? transaction.getTransactionDate().toString() : "2024-01-15",
            currentStatus,
            overallCheckInStatus,
            "Event in progress",
            overallProgress,
            java.time.LocalDateTime.now(),
            subcontractorProgress
        );
    }

    /**
     * Get all events progress
     */
    public List<EventProgressDTO> getAllEventsProgress() {
        // This would typically get all transactions and convert them to EventProgressDTO
        // For now, return empty list - would need to be implemented based on actual transaction data
        return List.of();
    }

    /**
     * Get subcontractor progress by user email
     */
    public List<SubcontractorProgressDTO> getSubcontractorProgressByUserEmail(String userEmail) {
        List<SubcontractorProgressEntity> progressEntities = subcontractorProgressRepository.findByUserEmail(userEmail);

        return progressEntities.stream()
            .map(entity -> new SubcontractorProgressDTO(
                entity.getSubcontractorProgressId(),
                entity.getTransactionProgress().getTransaction().getTransaction_Id(),
                entity.getSubcontractor().getSubcontractor_Id(),
                entity.getSubcontractor().getUser() != null ?
                    entity.getSubcontractor().getUser().getFirstname() + " " +
                    entity.getSubcontractor().getUser().getLastname() :
                    entity.getSubcontractor().getSubcontractor_serviceName(),
                entity.getSubcontractor().getSubcontractor_serviceCategory(),
                "/placeholder.svg", // Default avatar
                entity.getProgressPercentage(),
                entity.getCheckInStatus().toString(),
                entity.getProgressNotes(),
                entity.getProgressImageUrl(),
                entity.getComment(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
            ))
            .collect(Collectors.toList());
    }

    /**
     * Check if subcontractor progress exists by email
     */
    public boolean checkIfExistsByEmail(int transactionId, String userEmail) {
        // Find subcontractor by email
        SubcontractorEntity subcontractor = subContractorRepository.findByEmail(userEmail);
        if (subcontractor == null) {
            return false;
        }

        // Check if progress exists
        Optional<SubcontractorProgressEntity> existingProgress =
            subcontractorProgressRepository.findByTransactionIdAndSubcontractorId(transactionId, subcontractor.getSubcontractor_Id());

        return existingProgress.isPresent();
    }

    /**
     * Update subcontractor progress by email
     */
    public SubcontractorProgressEntity updateSubcontractorProgressByEmail(int transactionId, String userEmail,
                                                                         int progressPercentage, String checkInStatus, String notes, String imageUrlsJson, String comment) {
        // Find subcontractor by email
        SubcontractorEntity subcontractor = subContractorRepository.findByEmail(userEmail);
        if (subcontractor == null) {
            throw new RuntimeException("Subcontractor not found for email: " + userEmail);
        }

        // Use existing update method
        return updateSubcontractorProgress(transactionId, subcontractor.getSubcontractor_Id(), progressPercentage, checkInStatus, notes, imageUrlsJson, comment);
    }

    /**
     * Check if all subcontractors are approved and update transaction status to completed if so
     */
    private void checkAndUpdateTransactionStatus(int transactionId) {
        List<SubcontractorProgressEntity> subcontractorProgresses = getSubcontractorProgressByTransactionId(transactionId);

        // Check if all subcontractors are approved
        boolean allApproved = !subcontractorProgresses.isEmpty() &&
            subcontractorProgresses.stream()
                .allMatch(sp -> sp.getCheckInStatus() == SubcontractorProgressEntity.CheckInStatus.APPROVED);

        if (allApproved) {
            // Update transaction status to COMPLETED
            Optional<TransactionsEntity> transactionOpt = transactionRepo.findById(transactionId);
            if (transactionOpt.isPresent()) {
                TransactionsEntity transaction = transactionOpt.get();
                transaction.setTransactionStatus(TransactionsEntity.Status.COMPLETED);
                transactionRepo.save(transaction);
            }
        }
    }

    /**
     * Map transaction status to frontend status string
     */
    private String mapTransactionStatusToFrontend(TransactionsEntity.Status status) {
        switch (status) {
            case COMPLETED:
                return "completed";
            case PENDING:
                return "pending";
            case ONGOING:
                return "in-progress";
            case DECLINED:
                return "declined";
            case CANCELLED:
                return "cancelled";
            default:
                return "pending";
        }
    }
}
