package com.Project.Backend.Repository;

import com.Project.Backend.Entity.SubcontractorServiceEntity;
import com.Project.Backend.Entity.SubcontractorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubcontractorServiceRepository extends JpaRepository<SubcontractorServiceEntity, Integer> {

    @Modifying
    @Query("DELETE FROM SubcontractorServiceEntity s WHERE s.subcontractor = :subcontractor")
    void deleteBySubcontractor(@Param("subcontractor") SubcontractorEntity subcontractor);

    SubcontractorServiceEntity findBySubcontractorAndName(@Param("subcontractor") SubcontractorEntity subcontractor, @Param("name") String name);

    @Query("""
        SELECT COUNT(es) > 0
        FROM EventServiceEntity es
        JOIN es.subcontractorService ss
        JOIN es.transactionsId t
        WHERE ss.subcontractor.subcontractor_Id = :subcontractorId
        AND t.transactionStatus IN (PENDING, ONGOING)
    """)
    boolean hasOngoingBookings(@Param("subcontractorId") int subcontractorId);
}
