package com.vdenergy.inventory.materials.repository;

import com.vdenergy.inventory.materials.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long>, JpaSpecificationExecutor<Material> {
    Optional<Material> findByPublicCode(String publicCode);
}
