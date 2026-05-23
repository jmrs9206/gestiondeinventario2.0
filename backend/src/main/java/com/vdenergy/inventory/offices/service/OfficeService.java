package com.vdenergy.inventory.offices.service;

import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.common.exceptions.ConflictException;
import com.vdenergy.inventory.common.exceptions.ResourceNotFoundException;
import com.vdenergy.inventory.offices.dto.OfficeRequest;
import com.vdenergy.inventory.offices.dto.OfficeResponse;
import com.vdenergy.inventory.offices.entity.Office;
import com.vdenergy.inventory.offices.repository.OfficeRepository;
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

    public OfficeService(OfficeRepository officeRepository, AuditService auditService) {
        this.officeRepository = officeRepository;
        this.auditService = auditService;
    }

    @Transactional
    public OfficeResponse createOffice(OfficeRequest request, String performerPublicId, String ip, String userAgent) {
        if (officeRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new ConflictException("Office name already in use: " + request.getName());
        }

        String publicId = UUID.randomUUID().toString();
        Office office = new Office(publicId, request.getName());
        office.setActive(true);

        Office savedOffice = officeRepository.save(office);

        auditService.logEvent("Office", savedOffice.getPublicId(), "OFFICE_CREATED", "USER", performerPublicId, ip, userAgent);

        return new OfficeResponse(savedOffice);
    }

    @Transactional
    public OfficeResponse updateOffice(String publicId, OfficeRequest request, String performerPublicId, String ip, String userAgent) {
        Office office = officeRepository.findByPublicId(publicId)
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with public ID: " + publicId));

        Optional<Office> existingWithName = officeRepository.findByNameIgnoreCase(request.getName());
        if (existingWithName.isPresent() && !existingWithName.get().getPublicId().equals(publicId)) {
            throw new ConflictException("Office name already in use: " + request.getName());
        }

        office.setName(request.getName());
        Office updatedOffice = officeRepository.save(office);

        auditService.logEvent("Office", updatedOffice.getPublicId(), "OFFICE_UPDATED", "USER", performerPublicId, ip, userAgent);

        return new OfficeResponse(updatedOffice);
    }

    @Transactional
    public OfficeResponse deleteOffice(String publicId, String performerPublicId, String ip, String userAgent) {
        Office office = officeRepository.findByPublicId(publicId)
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with public ID: " + publicId));

        office.setActive(false);
        Office savedOffice = officeRepository.save(office);

        auditService.logEvent("Office", savedOffice.getPublicId(), "OFFICE_DISABLED", "USER", performerPublicId, ip, userAgent);

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
        Page<Office> officesPage = officeRepository.findByActiveTrue(pageable);
        return officesPage.map(OfficeResponse::new);
    }
}
