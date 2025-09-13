package com.Project.Backend.Repository;

import com.Project.Backend.Entity.SubcontractorServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubcontractorServiceRepository extends JpaRepository<SubcontractorServiceEntity, Integer> {
}
