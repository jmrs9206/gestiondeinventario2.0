package com.stockflow.inventory.materials.service;

import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.common.exceptions.ConflictException;
import com.stockflow.inventory.common.exceptions.ResourceNotFoundException;
import com.stockflow.inventory.inventory.entity.MaterialHistory;
import com.stockflow.inventory.inventory.repository.MaterialHistoryRepository;
import com.stockflow.inventory.materials.dto.MaterialRequest;
import com.stockflow.inventory.materials.dto.MaterialResponse;
import com.stockflow.inventory.materials.entity.Material;
import com.stockflow.inventory.materials.repository.MaterialRepository;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Optional;
import java.util.UUID;

@Service
public class MaterialService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final MaterialRepository materialRepository;
    private final MaterialHistoryRepository materialHistoryRepository;
    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public MaterialService(
            MaterialRepository materialRepository,
            MaterialHistoryRepository materialHistoryRepository,
            OfficeRepository officeRepository,
            UserRepository userRepository,
            AuditService auditService,
            ObjectMapper objectMapper) {
        this.materialRepository = materialRepository;
        this.materialHistoryRepository = materialHistoryRepository;
        this.officeRepository = officeRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String normalizeText(String input) {
        if (input == null) {
            return "";
        }
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{M}", "");
        return normalized.toUpperCase().trim();
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
                normalizeText(request.getMaterialType()),
                normalizeText(request.getBrand()),
                normalizeText(request.getModel()),
                normalizeText(request.getSerialNumber()),
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
        String newValueJson = toJson(new MaterialResponse(savedMaterial));
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_CREATED", "USER", performerPublicId, ip, userAgent, null, newValueJson);

        return new MaterialResponse(savedMaterial);
    }

    @Transactional
    public MaterialResponse updateMaterial(String publicCode, MaterialRequest request, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        String oldValueJson = toJson(new MaterialResponse(material));

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
        material.setMaterialType(normalizeText(request.getMaterialType()));
        material.setBrand(normalizeText(request.getBrand()));
        material.setModel(normalizeText(request.getModel()));
        material.setSerialNumber(normalizeText(request.getSerialNumber()));
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
        String newValueJson = toJson(new MaterialResponse(updatedMaterial));
        if (statusChanged) {
            auditService.logEvent("Material", updatedMaterial.getPublicCode(), "STATUS_CHANGED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);
        }
        if (officeChanged) {
            auditService.logEvent("Material", updatedMaterial.getPublicCode(), "OFFICE_CHANGED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);
        }
        auditService.logEvent("Material", updatedMaterial.getPublicCode(), "MATERIAL_UPDATED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new MaterialResponse(updatedMaterial);
    }

    @Transactional
    public MaterialResponse decommissionMaterial(String publicCode, String comment, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        String oldValueJson = toJson(new MaterialResponse(material));

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
        String newValueJson = toJson(new MaterialResponse(savedMaterial));
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_DECOMMISSIONED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

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
        return listMaterials(status, materialType, officePublicId, serialNumber, false, pageable);
    }

    @Transactional(readOnly = true)
    public Page<MaterialResponse> listMaterials(MaterialStatus status, String materialType, String officePublicId, String serialNumber, boolean includeInactive, Pageable pageable) {
        Specification<Material> spec = (root, query, cb) -> {
            if (status == MaterialStatus.BAJA) {
                return cb.equal(root.get("active"), false);
            } else if (includeInactive) {
                return cb.conjunction();
            } else {
                return cb.equal(root.get("active"), true);
            }
        };

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

    @Transactional
    public MaterialResponse reactivateMaterial(String publicCode, String comment, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with public code: " + publicCode));

        if (material.isActive()) {
            throw new ConflictException("Material is already active");
        }

        if (!material.getOffice().isActive()) {
            throw new ConflictException("Cannot reactivate material because its office '" + material.getOffice().getName() + "' is deactivated. Please reactivate the office first.");
        }

        String oldValueJson = toJson(new MaterialResponse(material));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        MaterialStatus prevStatus = material.getStatus();
        Office office = material.getOffice();

        material.setActive(true);
        material.setStatus(MaterialStatus.OPERATIVO);

        Material savedMaterial = materialRepository.save(material);

        MaterialHistory history = new MaterialHistory(
                savedMaterial,
                "MATERIAL_REACTIVATED",
                prevStatus,
                MaterialStatus.OPERATIVO,
                office,
                office,
                comment,
                performer
        );
        materialHistoryRepository.save(history);

        String newValueJson = toJson(new MaterialResponse(savedMaterial));
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_REACTIVATED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new MaterialResponse(savedMaterial);
    }

    @Transactional
    public void importMaterialsFromCsv(org.springframework.web.multipart.MultipartFile file, String performerPublicId, String ip, String userAgent) {
        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;
            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                if (line.trim().isEmpty()) {
                    continue;
                }
                
                String[] fields = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (fields.length < 5) {
                    continue;
                }

                String materialType = normalizeText(cleanCsvField(fields[0]));
                String brand = normalizeText(cleanCsvField(fields[1]));
                String model = normalizeText(cleanCsvField(fields[2]));
                String serialNumber = normalizeText(cleanCsvField(fields[3]));
                String officeName = normalizeText(cleanCsvField(fields[4]));
                String statusStr = fields.length > 5 ? cleanCsvField(fields[5]) : "OPERATIVO";

                if (materialType.isEmpty() || officeName.isEmpty()) {
                    continue;
                }

                Office office = officeRepository.findByNameIgnoreCase(officeName)
                        .orElseGet(() -> {
                            Office newOffice = new Office(UUID.randomUUID().toString(), officeName);
                            newOffice.setActive(true);
                            return officeRepository.save(newOffice);
                        });

                if (!office.isActive()) {
                    office.setActive(true);
                    office = officeRepository.save(office);
                }

                MaterialStatus status;
                try {
                    status = MaterialStatus.valueOf(statusStr.toUpperCase());
                } catch (Exception e) {
                    status = MaterialStatus.OPERATIVO;
                }

                String publicCode = generatePublicCode();
                while (materialRepository.findByPublicCode(publicCode).isPresent()) {
                    publicCode = generatePublicCode();
                }

                Material material = new Material(
                        publicCode,
                        materialType,
                        brand,
                        model,
                        serialNumber,
                        office,
                        status
                );
                material.setActive(true);
                Material savedMaterial = materialRepository.save(material);

                MaterialHistory history = new MaterialHistory(
                        savedMaterial,
                        "MATERIAL_IMPORTED",
                        null,
                        savedMaterial.getStatus(),
                        null,
                        savedMaterial.getOffice(),
                        "Importado vía masiva CSV",
                        performer
                );
                materialHistoryRepository.save(history);

                String newValueJson = toJson(new MaterialResponse(savedMaterial));
                auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_IMPORTED", "USER", performerPublicId, ip, userAgent, null, newValueJson);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error reading CSV file: " + e.getMessage(), e);
        }
    }

    private String cleanCsvField(String field) {
        if (field == null) {
            return "";
        }
        String trimmed = field.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed.replace("\"\"", "\"").trim();
    }

    @Transactional(readOnly = true)
    public String exportMaterialsToCsv() {
        java.util.List<Material> materials = materialRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("publicCode,materialType,brand,model,serialNumber,officeName,status,active\n");
        for (Material material : materials) {
            sb.append(escapeCsv(material.getPublicCode())).append(",")
              .append(escapeCsv(material.getMaterialType())).append(",")
              .append(escapeCsv(material.getBrand())).append(",")
              .append(escapeCsv(material.getModel())).append(",")
              .append(escapeCsv(material.getSerialNumber())).append(",")
              .append(escapeCsv(material.getOffice().getName())).append(",")
              .append(material.getStatus().name()).append(",")
              .append(material.isActive())
              .append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
