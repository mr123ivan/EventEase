package com.Project.Backend.Repository;

import com.Project.Backend.Entity.TransactionProgressEntity;
import com.Project.Backend.Entity.TransactionsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionProgressRepository extends JpaRepository<TransactionProgressEntity, Integer> {

    // Find progress by transaction ID
    @Query("SELECT tp FROM TransactionProgressEntity tp WHERE tp.transaction.transaction_Id = :transactionId")
    Optional<TransactionProgressEntity> findByTransactionId(@Param("transactionId") int transactionId);

    // Find progress by transaction entity
    Optional<TransactionProgressEntity> findByTransaction(TransactionsEntity transaction);

    // Find all progress records for a specific user
    @Query("SELECT tp FROM TransactionProgressEntity tp WHERE tp.transaction.user.email = :userEmail")
    List<TransactionProgressEntity> findByUserEmail(@Param("userEmail") String userEmail);

    // Find progress records by status
    List<TransactionProgressEntity> findByStatus(TransactionProgressEntity.ProgressStatus status);

    // Find progress records by progress range
    @Query("SELECT tp FROM TransactionProgressEntity tp WHERE tp.currentProgress BETWEEN :minProgress AND :maxProgress")
    List<TransactionProgressEntity> findByProgressRange(@Param("minProgress") int minProgress, @Param("maxProgress") int maxProgress);

    // Check if progress exists for a transaction
    @Query("SELECT CASE WHEN COUNT(tp) > 0 THEN true ELSE false END FROM TransactionProgressEntity tp WHERE tp.transaction.transaction_Id = :transactionId")
    boolean existsByTransactionId(@Param("transactionId") int transactionId);
}
