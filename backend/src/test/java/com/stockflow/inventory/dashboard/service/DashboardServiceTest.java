package com.stockflow.inventory.dashboard.service;

import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.dashboard.dto.DashboardKpisResponse;
import com.stockflow.inventory.dashboard.dto.OfficeCountDto;
import com.stockflow.inventory.inventory.repository.MaterialHistoryRepository;
import com.stockflow.inventory.materials.entity.Material;
import com.stockflow.inventory.materials.repository.MaterialRepository;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private OfficeRepository officeRepository;

    @Mock
    private MaterialHistoryRepository materialHistoryRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getKpisCalculatesCorrectly() {
        Office office1 = new Office("off-1", "Office 1");
        office1.setActive(true);
        Office office2 = new Office("off-2", "Office 2");
        office2.setActive(true);

        when(officeRepository.findAll()).thenReturn(List.of(office1, office2));

        Material material1 = new Material("mat-1", "Laptop", "Dell", "Lat", "SN1", office1, MaterialStatus.OPERATIVO);
        material1.setActive(true);
        Material material2 = new Material("mat-2", "Screen", "HP", "E24", "SN2", office1, MaterialStatus.ROTO);
        material2.setActive(true);
        Material material3 = new Material("mat-3", "Phone", "Apple", "IP", "SN3", office2, MaterialStatus.OPERATIVO);
        material3.setActive(false); // Inactive

        when(materialRepository.findAll()).thenReturn(List.of(material1, material2, material3));

        // Mean repair time mock
        when(materialHistoryRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(Collections.emptyList());

        DashboardKpisResponse kpis = dashboardService.getKpis();

        assertNotNull(kpis);
        assertEquals(2, kpis.getTotalMaterials()); // Only active ones (material1, material2)
        assertEquals(1, kpis.getIncidencesCount()); // Only active broken ones (material2 is ROTO)
        assertEquals(0.0, kpis.getMeanRepairTimeInHours());

        // Verify status counts
        assertEquals(2L, kpis.getStatusCounts().get("OPERATIVO")); // mat-1 (active) + mat-3 (inactive)
        assertEquals(1L, kpis.getStatusCounts().get("ROTO")); // mat-2 (active)
        assertEquals(0L, kpis.getStatusCounts().get("EN_REPARACION"));
        assertEquals(0L, kpis.getStatusCounts().get("BAJA"));

        // Verify office counts
        OfficeCountDto off1Dto = kpis.getOfficeCounts().stream().filter(dto -> dto.getPublicId().equals("off-1")).findFirst().orElseThrow();
        assertEquals(2L, off1Dto.getCount()); // mat-1 and mat-2

        OfficeCountDto off2Dto = kpis.getOfficeCounts().stream().filter(dto -> dto.getPublicId().equals("off-2")).findFirst().orElseThrow();
        assertEquals(0L, off2Dto.getCount()); // mat-3 is inactive, so count is 0
    }
}
