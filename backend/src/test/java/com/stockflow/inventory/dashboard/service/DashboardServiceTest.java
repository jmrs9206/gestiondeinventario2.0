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

        // Workstation assertions
        assertEquals(0L, kpis.getCompleteWorkstations());
        assertEquals(0L, kpis.getPartialWorkstations());
        assertEquals(0L, kpis.getSpecialWorkstations());
        assertEquals(0L, kpis.getLeftoverMonitors());
        assertEquals(0L, kpis.getLeftoverKeyboards());
        assertEquals(0L, kpis.getLeftoverMice());
        assertEquals(0L, kpis.getLeftoverHeadphones());
    }

    @Test
    void getKpisCalculatesWorkstationsCorrectly() {
        Office office1 = new Office("off-1", "Office 1");
        office1.setActive(true);
        when(officeRepository.findAll()).thenReturn(List.of(office1));

        // Office 1 resources:
        // Monitors: 3 operational, 1 ROTO (should not count)
        Material m1 = new Material("mat-m1", "MONITOR", "LG", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        m1.setActive(true);
        Material m2 = new Material("mat-m2", "MONITOR", "LG", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        m2.setActive(true);
        Material m3 = new Material("mat-m3", "MONITOR", "LG", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        m3.setActive(true);
        Material m4 = new Material("mat-m4", "MONITOR", "LG", "Model", "SN", office1, MaterialStatus.ROTO);
        m4.setActive(true);

        // Keyboards: 2 operational, 1 inactive (should not count)
        Material k1 = new Material("mat-k1", "TECLADO", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        k1.setActive(true);
        Material k2 = new Material("mat-k2", "TECLADO", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        k2.setActive(true);
        Material k3 = new Material("mat-k3", "TECLADO", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        k3.setActive(false);

        // Mice: 2 operational
        Material r1 = new Material("mat-r1", "RATON", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        r1.setActive(true);
        Material r2 = new Material("mat-r2", "RATON", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        r2.setActive(true);

        // Headphones: 3 operational
        Material a1 = new Material("mat-a1", "AUDIFONOS", "Sony", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        a1.setActive(true);
        Material a2 = new Material("mat-a2", "AUDIFONOS", "Sony", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        a2.setActive(true);
        Material a3 = new Material("mat-a3", "AUDIFONOS", "Sony", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        a3.setActive(true);

        when(materialRepository.findAll()).thenReturn(List.of(m1, m2, m3, m4, k1, k2, k3, r1, r2, a1, a2, a3));
        when(materialHistoryRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(Collections.emptyList());

        DashboardKpisResponse kpis = dashboardService.getKpis();

        assertNotNull(kpis);
        // Expecting:
        // monitors = 3, keyboards = 2, mice = 2, headphones = 3
        // 1. Special: min(3/2, 2, 2, 3) = min(1, 2, 2, 3) = 1
        // Remaining: monitors = 1, keyboards = 1, mice = 1, headphones = 2
        // 2. Complete: min(1, 1, 1, 2/2) = min(1, 1, 1, 1) = 1
        // Remaining: monitors = 0, keyboards = 0, mice = 0, headphones = 0
        // 3. Partial: min(0, 0, 0, 0) = 0
        assertEquals(1L, kpis.getSpecialWorkstations());
        assertEquals(1L, kpis.getCompleteWorkstations());
        assertEquals(0L, kpis.getPartialWorkstations());
        assertEquals(0L, kpis.getLeftoverMonitors());
        assertEquals(0L, kpis.getLeftoverKeyboards());
        assertEquals(0L, kpis.getLeftoverMice());
        assertEquals(0L, kpis.getLeftoverHeadphones());
    }

    @Test
    void getKpisCalculatesLeftoversCorrectly() {
        Office office1 = new Office("off-1", "Office 1");
        office1.setActive(true);
        when(officeRepository.findAll()).thenReturn(List.of(office1));

        // Office 1 resources: M=2, T=3, R=4, A=1
        Material m1 = new Material("mat-m1", "MONITOR", "LG", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        m1.setActive(true);
        Material m2 = new Material("mat-m2", "MONITOR", "LG", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        m2.setActive(true);

        Material k1 = new Material("mat-k1", "TECLADO", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        k1.setActive(true);
        Material k2 = new Material("mat-k2", "TECLADO", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        k2.setActive(true);
        Material k3 = new Material("mat-k3", "TECLADO", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        k3.setActive(true);

        Material r1 = new Material("mat-r1", "RATON", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        r1.setActive(true);
        Material r2 = new Material("mat-r2", "RATON", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        r2.setActive(true);
        Material r3 = new Material("mat-r3", "RATON", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        r3.setActive(true);
        Material r4 = new Material("mat-r4", "RATON", "Logitech", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        r4.setActive(true);

        Material a1 = new Material("mat-a1", "AUDIFONOS", "Sony", "Model", "SN", office1, MaterialStatus.OPERATIVO);
        a1.setActive(true);

        when(materialRepository.findAll()).thenReturn(List.of(m1, m2, k1, k2, k3, r1, r2, r3, r4, a1));
        when(materialHistoryRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(Collections.emptyList());

        DashboardKpisResponse kpis = dashboardService.getKpis();

        assertNotNull(kpis);
        // Expecting:
        // Special = min(2/2, 3, 4, 1) = 1. Remaining: M=0, T=2, R=3, A=0
        // Complete = 0
        // Partial = 0
        // Leftovers: M=0, T=2, R=3, A=0
        assertEquals(1L, kpis.getSpecialWorkstations());
        assertEquals(0L, kpis.getCompleteWorkstations());
        assertEquals(0L, kpis.getPartialWorkstations());
        assertEquals(0L, kpis.getLeftoverMonitors());
        assertEquals(2L, kpis.getLeftoverKeyboards());
        assertEquals(3L, kpis.getLeftoverMice());
        assertEquals(0L, kpis.getLeftoverHeadphones());
    }
}
