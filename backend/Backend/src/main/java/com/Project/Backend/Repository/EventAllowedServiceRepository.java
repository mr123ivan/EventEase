package com.Project.Backend.Repository;

import com.Project.Backend.Entity.EventAllowedServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface EventAllowedServiceRepository extends JpaRepository<EventAllowedServiceEntity, Integer> {
    @Query("select eas from EventAllowedServiceEntity eas where eas.event.event_Id = :eventId")
    List<EventAllowedServiceEntity> findByEventId(@Param("eventId") int eventId);
}
