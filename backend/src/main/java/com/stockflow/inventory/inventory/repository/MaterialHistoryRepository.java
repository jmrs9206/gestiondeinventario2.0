package com.stockflow.inventory.inventory.repository;

import com.stockflow.inventory.inventory.entity.MaterialHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialHistoryRepository extends JpaRepository<MaterialHistory, Long>, JpaSpecificationExecutor<MaterialHistory> {

    @Override
    @EntityGraph(attributePaths = {"material", "previousOffice", "newOffice", "performedByUser"})
    Page<MaterialHistory> findAll(Specification<MaterialHistory> spec, Pageable pageable);
}
