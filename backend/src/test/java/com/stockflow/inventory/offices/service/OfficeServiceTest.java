package com.stockflow.inventory.offices.service;

import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.common.exceptions.ConflictException;
import com.stockflow.inventory.common.exceptions.ResourceNotFoundException;
import com.stockflow.inventory.offices.dto.OfficeRequest;
import com.stockflow.inventory.offices.dto.OfficeResponse;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class OfficeServiceTest {

    @Mock
    private OfficeRepository officeRepository;

    @Mock
    private AuditService auditService;

    private OfficeService officeService;

    @BeforeEach
    void setUp() {
        officeService = new OfficeService(officeRepository, auditService, new ObjectMapper());
    }

    @Test
    void createOfficeSuccessful() {
        OfficeRequest request = new OfficeRequest();
        request.setName("Sede Valencia");

        when(officeRepository.findByNameIgnoreCase("SEDE VALENCIA")).thenReturn(Optional.empty());
        when(officeRepository.save(any(Office.class))).thenAnswer(invocation -> {
            Office saved = invocation.getArgument(0);
            return saved;
        });

        OfficeResponse response = officeService.createOffice(request, "performer-id", "127.0.0.1", "Mozilla");

        assertNotNull(response);
        assertEquals("SEDE VALENCIA", response.getName());
        assertTrue(response.isActive());
        verify(auditService, times(1)).logEvent(
                eq("Office"), any(), eq("OFFICE_CREATED"), eq("USER"), eq("performer-id"), eq("127.0.0.1"), eq("Mozilla"), any(), any()
        );
    }

    @Test
    void createOfficeThrowsConflict() {
        OfficeRequest request = new OfficeRequest();
        request.setName("Sede Valencia");

        Office existing = new Office("existing-id", "SEDE VALENCIA");
        when(officeRepository.findByNameIgnoreCase("SEDE VALENCIA")).thenReturn(Optional.of(existing));

        assertThrows(ConflictException.class, () ->
                officeService.createOffice(request, "performer-id", "127.0.0.1", "Mozilla")
        );
        verify(officeRepository, never()).save(any());
    }

    @Test
    void updateOfficeThrowsNotFound() {
        OfficeRequest request = new OfficeRequest();
        request.setName("Valencia Nueva");

        when(officeRepository.findByPublicId("non-existing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                officeService.updateOffice("non-existing", request, "perf-id", "ip", "agent")
        );
    }
}
