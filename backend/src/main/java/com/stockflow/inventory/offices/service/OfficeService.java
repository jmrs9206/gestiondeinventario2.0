package com.stockflow.inventory.offices.service;

import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.common.exceptions.ConflictException;
import com.stockflow.inventory.common.exceptions.ResourceNotFoundException;
import com.stockflow.inventory.offices.dto.OfficeRequest;
import com.stockflow.inventory.offices.dto.OfficeResponse;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class OfficeService {

    private final OfficeRepository officeRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public OfficeService(OfficeRepository officeRepository, AuditService auditService, ObjectMapper objectMapper) {
        this.officeRepository = officeRepository;
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
        return com.stockflow.inventory.common.utils.TextNormalizer.normalize(input);
    }

    @Transactional
    public OfficeResponse createOffice(OfficeRequest request, String performerPublicId, String ip, String userAgent) {
        String normalizedName = normalizeText(request.getName());
        if (officeRepository.findByNameIgnoreCase(normalizedName).isPresent()) {
            throw new ConflictException("Office name already in use: " + normalizedName);
        }

        String publicId = UUID.randomUUID().toString();
        Office office = new Office(publicId, normalizedName);
        office.setActive(true);

        Office savedOffice = officeRepository.save(office);

        String newValueJson = toJson(new OfficeResponse(savedOffice));
        auditService.logEvent("Office", savedOffice.getPublicId(), "OFFICE_CREATED", "USER", performerPublicId, ip, userAgent, null, newValueJson);

        return new OfficeResponse(savedOffice);
    }

    @Transactional
    public OfficeResponse updateOffice(String publicId, OfficeRequest request, String performerPublicId, String ip, String userAgent) {
        Office office = officeRepository.findByPublicId(publicId)
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with public ID: " + publicId));

        String normalizedName = normalizeText(request.getName());
        Optional<Office> existingWithName = officeRepository.findByNameIgnoreCase(normalizedName);
        if (existingWithName.isPresent() && !existingWithName.get().getPublicId().equals(publicId)) {
            throw new ConflictException("Office name already in use: " + normalizedName);
        }

        String oldValueJson = toJson(new OfficeResponse(office));

        office.setName(normalizedName);
        Office updatedOffice = officeRepository.save(office);

        String newValueJson = toJson(new OfficeResponse(updatedOffice));
        auditService.logEvent("Office", updatedOffice.getPublicId(), "OFFICE_UPDATED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new OfficeResponse(updatedOffice);
    }

    @Transactional
    public OfficeResponse deleteOffice(String publicId, String performerPublicId, String ip, String userAgent) {
        Office office = officeRepository.findByPublicId(publicId)
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with public ID: " + publicId));

        String oldValueJson = toJson(new OfficeResponse(office));

        office.setActive(false);
        Office savedOffice = officeRepository.save(office);

        String newValueJson = toJson(new OfficeResponse(savedOffice));
        auditService.logEvent("Office", savedOffice.getPublicId(), "OFFICE_DISABLED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new OfficeResponse(savedOffice);
    }

    @Transactional(readOnly = true)
    public OfficeResponse getOfficeByPublicId(String publicId) {
        Office office = officeRepository.findByPublicId(publicId)
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with public ID: " + publicId));
        return new OfficeResponse(office);
    }

    @Transactional(readOnly = true)
    public Page<OfficeResponse> listActiveOffices(Pageable pageable) {
        return listOffices(false, pageable);
    }

    @Transactional(readOnly = true)
    public Page<OfficeResponse> listOffices(boolean includeInactive, Pageable pageable) {
        Page<Office> officesPage = includeInactive ? officeRepository.findAll(pageable) : officeRepository.findByActiveTrue(pageable);
        return officesPage.map(OfficeResponse::new);
    }

    @Transactional
    public OfficeResponse reactivateOffice(String publicId, String performerPublicId, String ip, String userAgent) {
        Office office = officeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with public ID: " + publicId));

        if (office.isActive()) {
            throw new ConflictException("Office is already active");
        }

        Optional<Office> existingWithName = officeRepository.findByNameIgnoreCase(office.getName());
        if (existingWithName.isPresent() && !existingWithName.get().getPublicId().equals(publicId) && existingWithName.get().isActive()) {
            throw new ConflictException("An active office with this name already exists");
        }

        String oldValueJson = toJson(new OfficeResponse(office));

        office.setActive(true);
        Office savedOffice = officeRepository.save(office);

        String newValueJson = toJson(new OfficeResponse(savedOffice));
        auditService.logEvent("Office", savedOffice.getPublicId(), "OFFICE_REACTIVATED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new OfficeResponse(savedOffice);
    }
}

