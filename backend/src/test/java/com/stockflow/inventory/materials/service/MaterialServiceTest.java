package com.stockflow.inventory.materials.service;

import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.common.entity.MaterialStatus;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaterialServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialHistoryRepository materialHistoryRepository;

    @Mock
    private OfficeRepository officeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MaterialService materialService;

    @Test
    void createMaterialWithInactiveOfficeThrowsException() {
        MaterialRequest request = new MaterialRequest();
        request.setOfficePublicId("office_123");

        Office office = new Office();
        office.setActive(false); // Inactive office

        when(officeRepository.findByPublicId("office_123")).thenReturn(Optional.of(office));

        assertThrows(ResourceNotFoundException.class, () ->
            materialService.createMaterial(request, "performer_123", "127.0.0.1", "Agent")
        );

        verify(materialRepository, never()).save(any());
    }

    @Test
    void createMaterialSuccessfully() {
        MaterialRequest request = new MaterialRequest();
        request.setOfficePublicId("office_123");
        request.setMaterialType("Laptop");
        request.setBrand("Dell");
        request.setModel("Latitude");
        request.setSerialNumber("SN-12345");
        request.setStatus(MaterialStatus.OPERATIVO);
        request.setComment("New Laptop");

        Office office = new Office("office_123", "Office HQ");
        office.setActive(true);

        User performer = new User();
        performer.setPublicId("performer_123");

        when(officeRepository.findByPublicId("office_123")).thenReturn(Optional.of(office));
        when(userRepository.findByPublicId("performer_123")).thenReturn(Optional.of(performer));
        when(materialRepository.findByPublicCode(any())).thenReturn(Optional.empty());

        Material material = new Material("mat_code", "Laptop", "Dell", "Latitude", "SN-12345", office, MaterialStatus.OPERATIVO);
        material.setActive(true);
        when(materialRepository.save(any(Material.class))).thenReturn(material);

        MaterialResponse response = materialService.createMaterial(request, "performer_123", "127.0.0.1", "Agent");

        assertNotNull(response);
        assertEquals("Laptop", response.getMaterialType());
        verify(materialRepository).save(any());
        verify(materialHistoryRepository).save(any(MaterialHistory.class));
        verify(auditService).logEvent(eq("Material"), anyString(), eq("MATERIAL_CREATED"), eq("USER"), eq("performer_123"), eq("127.0.0.1"), eq("Agent"), any(), any());
    }
}
