package com.stockflow.inventory.materials.repository;

import com.stockflow.inventory.materials.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long>, JpaSpecificationExecutor<Material> {
    Optional<Material> findByPublicCode(String publicCode);

    @Override
    @EntityGraph(attributePaths = {"office"})
    List<Material> findAll();

    @Override
    @EntityGraph(attributePaths = {"office"})
    Page<Material> findAll(Specification<Material> spec, Pageable pageable);
}
