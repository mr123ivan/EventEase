package com.Project.Backend.Repository;

import com.Project.Backend.DTO.TransactionPaymentAndSubcontractorsDTO;
import com.Project.Backend.DTO.TransactionUserEventAndPackageDTO;
import com.Project.Backend.Entity.TransactionsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface TransactionRepo extends JpaRepository<TransactionsEntity, Integer> {

    // Change from findByEventEntity_Event_id to findByEventEntityId
    @Query("SELECT t FROM TransactionsEntity t WHERE t.event.event_Id= :eventId")
    List<TransactionsEntity> findByEventEntityId(int eventId);

    @Query("SELECT t FROM TransactionsEntity t WHERE t.transactionStatus = :status AND t.transactionIsActive = :isActive")
    List<TransactionsEntity> findByTransactionStatusAndIsActive(TransactionsEntity.Status status, boolean isActive);
    
    // Change from findByTransaction_isActiveTrue to findByTransactionIsActiveTrue
    List<TransactionsEntity> findByTransactionIsActiveTrue();

    @Query("SELECT t FROM TransactionsEntity t " +
            "JOIN FETCH t.user u " +
            "JOIN FETCH t.event e " +
            "LEFT JOIN FETCH t.eventServices es " +
            "LEFT JOIN FETCH es.subcontractor")
    List<TransactionsEntity> findAllWithRelations();

    @org.springframework.data.jpa.repository.Query("SELECT t FROM TransactionsEntity t WHERE t.user.userId = :userId")
    List<TransactionsEntity> findByUserId(int userId);


//new query for user transactions - Ivan
    @Query("SELECT t FROM TransactionsEntity t WHERE t.user.email = :email")
    List<TransactionsEntity> findByUserEmail(@Param("email") String email);
    
    @Query("SELECT t FROM TransactionsEntity t JOIN t.eventServices es WHERE es.subcontractor.user.email = :email")
    List<TransactionsEntity> getAllTransactionsByEventService(@Param("email") String email);

    @Query("""
    SELECT new com.Project.Backend.DTO.TransactionUserEventAndPackageDTO(
        t.transaction_Id,
        u.firstname,
        u.email, u.phoneNumber,
        e.event_name,
        t.transactionVenue,
        t.transactionStatus,
        t.transactionDate,
        t.transactionNote,
        p.packageName
    )
    FROM TransactionsEntity t
    LEFT JOIN t.user u
    LEFT JOIN t.event e
    LEFT JOIN t.packages p
""")
    List<TransactionUserEventAndPackageDTO> findAllJoinedWithUserAndEventAndPackages();

    @Query("""
    SELECT DISTINCT new com.Project.Backend.DTO.TransactionPaymentAndSubcontractorsDTO(
        t.transaction_Id, p.paymentReferenceNumber,
        p.paymentNote, p.paymentReceipt,null
    )
    FROM TransactionsEntity t
    LEFT JOIN t.payment p
    LEFT JOIN t.eventServices e
    LEFT JOIN e.subcontractor s
    WHERE t.transaction_Id = :transactionId
""")
    TransactionPaymentAndSubcontractorsDTO findAllJoinedWIthPaymentAndSubcontractorsByTransactionId(@Param("transactionId") int transactionId);

    @Query("SELECT t FROM TransactionsEntity t")
    TransactionsEntity getAllTransactionsDate();

    @Query("SELECT t FROM TransactionsEntity t JOIN t.eventServices es WHERE es.subcontractor.subcontractor_Id = :subcontractorId")
    List<TransactionsEntity> findTransactionsBySubcontractorId(@Param("subcontractorId") int subcontractorId);

}
