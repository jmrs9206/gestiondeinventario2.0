package com.stockflow.inventory.inventory.service;

import com.stockflow.inventory.common.exceptions.ResourceNotFoundException;
import com.stockflow.inventory.inventory.dto.MaterialHistoryResponse;
import com.stockflow.inventory.inventory.entity.MaterialHistory;
import com.stockflow.inventory.inventory.repository.MaterialHistoryRepository;
import com.stockflow.inventory.materials.entity.Material;
import com.stockflow.inventory.materials.repository.MaterialRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaterialHistoryService {

    private final MaterialHistoryRepository materialHistoryRepository;
    private final MaterialRepository materialRepository;

    public MaterialHistoryService(MaterialHistoryRepository materialHistoryRepository, MaterialRepository materialRepository) {
        this.materialHistoryRepository = materialHistoryRepository;
        this.materialRepository = materialRepository;
    }

    @Transactional(readOnly = true)
    public Page<MaterialHistoryResponse> getHistory(String materialPublicCode, String action, Pageable pageable) {
        if (materialPublicCode != null && !materialPublicCode.trim().isEmpty()) {
            // Verify material exists and is active
            materialRepository.findByPublicCode(materialPublicCode.trim())
                    .filter(Material::isActive)
                    .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + materialPublicCode));
        }

        Specification<MaterialHistory> spec = Specification.where(null);

        if (materialPublicCode != null && !materialPublicCode.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("material").get("publicCode"), materialPublicCode.trim()));
        }

        if (action != null && !action.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("action"), action.trim()));
        }

        // Order history chronologically by default (newest first)
        if (pageable.getSort().isUnsorted()) {
            pageable = org.springframework.data.domain.PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id")
            );
        }

        Page<MaterialHistory> historyPage = materialHistoryRepository.findAll(spec, pageable);
        return historyPage.map(MaterialHistoryResponse::new);
    }
}
