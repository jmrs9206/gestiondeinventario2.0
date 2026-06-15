package com.stockflow.inventory.offices.repository;

import com.stockflow.inventory.offices.entity.Office;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfficeRepository extends JpaRepository<Office, Long> {
    Optional<Office> findByPublicId(String publicId);
    Optional<Office> findByNameIgnoreCase(String name);
    Page<Office> findByActiveTrue(Pageable pageable);
}
