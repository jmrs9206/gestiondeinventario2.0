package com.vdenergy.inventory.materials.service;

import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.common.entity.MaterialStatus;
import com.vdenergy.inventory.common.exceptions.ResourceNotFoundException;
import com.vdenergy.inventory.inventory.entity.MaterialHistory;
import com.vdenergy.inventory.inventory.repository.MaterialHistoryRepository;
import com.vdenergy.inventory.materials.dto.MaterialRequest;
import com.vdenergy.inventory.materials.dto.MaterialResponse;
import com.vdenergy.inventory.materials.entity.Material;
import com.vdenergy.inventory.materials.repository.MaterialRepository;
import com.vdenergy.inventory.offices.entity.Office;
import com.vdenergy.inventory.offices.repository.OfficeRepository;
import com.vdenergy.inventory.users.entity.User;
import com.vdenergy.inventory.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class MaterialService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final MaterialRepository materialRepository;
    private final MaterialHistoryRepository materialHistoryRepository;
    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public MaterialService(
            MaterialRepository materialRepository,
            MaterialHistoryRepository materialHistoryRepository,
            OfficeRepository officeRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.materialRepository = materialRepository;
        this.materialHistoryRepository = materialHistoryRepository;
        this.officeRepository = officeRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    private String generatePublicCode() {
        StringBuilder sb = new StringBuilder(24);
        sb.append("mat_");
        for (int i = 0; i < 20; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    @Transactional
    public MaterialResponse createMaterial(MaterialRequest request, String performerPublicId, String ip, String userAgent) {
        Office office = officeRepository.findByPublicId(request.getOfficePublicId())
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active office not found with public ID: " + request.getOfficePublicId()));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        String publicCode = generatePublicCode();
        // Ensure uniqueness just in case
        while (materialRepository.findByPublicCode(publicCode).isPresent()) {
            publicCode = generatePublicCode();
        }

        Material material = new Material(
                publicCode,
                request.getMaterialType(),
                request.getBrand(),
                request.getModel(),
                request.getSerialNumber(),
                office,
                request.getStatus()
        );
        material.setActive(true);

        Material savedMaterial = materialRepository.save(material);

        // Write operational history
        MaterialHistory history = new MaterialHistory(
                savedMaterial,
                "MATERIAL_CREATED",
                null,
                savedMaterial.getStatus(),
                null,
                savedMaterial.getOffice(),
                request.getComment(),
                performer
        );
        materialHistoryRepository.save(history);

        // Log audit
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_CREATED", "USER", performerPublicId, ip, userAgent);

        return new MaterialResponse(savedMaterial);
    }

    @Transactional
    public MaterialResponse updateMaterial(String publicCode, MaterialRequest request, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        Office newOffice = officeRepository.findByPublicId(request.getOfficePublicId())
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active office not found with public ID: " + request.getOfficePublicId()));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        boolean statusChanged = !material.getStatus().equals(request.getStatus());
        boolean officeChanged = !material.getOffice().getPublicId().equals(request.getOfficePublicId());

        MaterialStatus prevStatus = material.getStatus();
        Office prevOffice = material.getOffice();

        // Update fields
        material.setMaterialType(request.getMaterialType());
        material.setBrand(request.getBrand());
        material.setModel(request.getModel());
        material.setSerialNumber(request.getSerialNumber());
        material.setOffice(newOffice);
        material.setStatus(request.getStatus());

        Material updatedMaterial = materialRepository.save(material);

        // Create MaterialHistory record
        String historyAction = "MATERIAL_UPDATED";
        if (statusChanged && officeChanged) {
            historyAction = "STATUS_AND_OFFICE_CHANGED";
        } else if (statusChanged) {
            historyAction = "STATUS_CHANGED";
        } else if (officeChanged) {
            historyAction = "OFFICE_CHANGED";
        }

        MaterialHistory history = new MaterialHistory(
                updatedMaterial,
                historyAction,
                prevStatus,
                updatedMaterial.getStatus(),
                prevOffice,
                updatedMaterial.getOffice(),
                request.getComment(),
                performer
        );
        materialHistoryRepository.save(history);

        // Log audits
        if (statusChanged) {
            auditService.logEvent("Material", updatedMaterial.getPublicCode(), "STATUS_CHANGED", "USER", performerPublicId, ip, userAgent);
        }
        if (officeChanged) {
            auditService.logEvent("Material", updatedMaterial.getPublicCode(), "OFFICE_CHANGED", "USER", performerPublicId, ip, userAgent);
        }
        auditService.logEvent("Material", updatedMaterial.getPublicCode(), "MATERIAL_UPDATED", "USER", performerPublicId, ip, userAgent);

        return new MaterialResponse(updatedMaterial);
    }

    @Transactional
    public MaterialResponse decommissionMaterial(String publicCode, String comment, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        MaterialStatus prevStatus = material.getStatus();
        Office office = material.getOffice();

        // Soft delete / decommission
        material.setActive(false);
        material.setStatus(MaterialStatus.BAJA);

        Material savedMaterial = materialRepository.save(material);

        // Create MaterialHistory record
        MaterialHistory history = new MaterialHistory(
                savedMaterial,
                "MATERIAL_DECOMMISSIONED",
                prevStatus,
                MaterialStatus.BAJA,
                office,
                office,
                comment,
                performer
        );
        materialHistoryRepository.save(history);

        // Log audit
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_DECOMMISSIONED", "USER", performerPublicId, ip, userAgent);

        return new MaterialResponse(savedMaterial);
    }

    @Transactional(readOnly = true)
    public MaterialResponse getMaterialByPublicCode(String publicCode) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));
        return new MaterialResponse(material);
    }

    @Transactional(readOnly = true)
    public Page<MaterialResponse> listMaterials(MaterialStatus status, String materialType, String officePublicId, String serialNumber, Pageable pageable) {
        Specification<Material> spec = (root, query, cb) -> cb.equal(root.get("active"), true);

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (materialType != null && !materialType.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("materialType")), "%" + materialType.trim().toLowerCase() + "%"));
        }
        if (officePublicId != null && !officePublicId.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("office").get("publicId"), officePublicId.trim()));
        }
        if (serialNumber != null && !serialNumber.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("serialNumber")), "%" + serialNumber.trim().toLowerCase() + "%"));
        }

        Page<Material> materials = materialRepository.findAll(spec, pageable);
        return materials.map(MaterialResponse::new);
    }
}
