package com.vdenergy.inventory.offices.service;

import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.common.exceptions.ConflictException;
import com.vdenergy.inventory.common.exceptions.ResourceNotFoundException;
import com.vdenergy.inventory.offices.dto.OfficeRequest;
import com.vdenergy.inventory.offices.dto.OfficeResponse;
import com.vdenergy.inventory.offices.entity.Office;
import com.vdenergy.inventory.offices.repository.OfficeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfficeServiceTest {

    @Mock
    private OfficeRepository officeRepository;

    @Mock
    private AuditService auditService;

    private OfficeService officeService;

    @BeforeEach
    void setUp() {
        officeService = new OfficeService(officeRepository, auditService);
    }

    @Test
    void createOfficeSuccessful() {
        OfficeRequest request = new OfficeRequest();
        request.setName("Sede Valencia");

        when(officeRepository.findByNameIgnoreCase("Sede Valencia")).thenReturn(Optional.empty());
        when(officeRepository.save(any(Office.class))).thenAnswer(invocation -> {
            Office saved = invocation.getArgument(0);
            return saved;
        });

        OfficeResponse response = officeService.createOffice(request, "performer-id", "127.0.0.1", "Mozilla");

        assertNotNull(response);
        assertEquals("Sede Valencia", response.getName());
        assertTrue(response.isActive());
        verify(auditService, times(1)).logEvent(
                eq("Office"), any(), eq("OFFICE_CREATED"), eq("USER"), eq("performer-id"), eq("127.0.0.1"), eq("Mozilla")
        );
    }

    @Test
    void createOfficeThrowsConflict() {
        OfficeRequest request = new OfficeRequest();
        request.setName("Sede Valencia");

        Office existing = new Office("existing-id", "Sede Valencia");
        when(officeRepository.findByNameIgnoreCase("Sede Valencia")).thenReturn(Optional.of(existing));

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
