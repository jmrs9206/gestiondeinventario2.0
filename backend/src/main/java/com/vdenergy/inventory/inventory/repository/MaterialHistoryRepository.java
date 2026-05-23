package com.vdenergy.inventory.inventory.repository;

import com.vdenergy.inventory.inventory.entity.MaterialHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialHistoryRepository extends JpaRepository<MaterialHistory, Long>, JpaSpecificationExecutor<MaterialHistory> {
}
