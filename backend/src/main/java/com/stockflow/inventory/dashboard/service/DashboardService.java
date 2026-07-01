package com.stockflow.inventory.dashboard.service;

import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.dashboard.dto.DashboardKpisResponse;
import com.stockflow.inventory.dashboard.dto.OfficeCountDto;
import com.stockflow.inventory.inventory.entity.MaterialHistory;
import com.stockflow.inventory.inventory.repository.MaterialHistoryRepository;
import com.stockflow.inventory.materials.entity.Material;
import com.stockflow.inventory.materials.repository.MaterialRepository;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final MaterialRepository materialRepository;
    private final OfficeRepository officeRepository;
    private final MaterialHistoryRepository materialHistoryRepository;

    public DashboardService(
            MaterialRepository materialRepository,
            OfficeRepository officeRepository,
            MaterialHistoryRepository materialHistoryRepository
    ) {
        this.materialRepository = materialRepository;
        this.officeRepository = officeRepository;
        this.materialHistoryRepository = materialHistoryRepository;
    }

    @Transactional(readOnly = true)
    public DashboardKpisResponse getKpis() {
        // 1. Fetch all materials
        List<Material> allMaterials = materialRepository.findAll();

        // Calculate total active materials and statuses
        long totalMaterials = 0;
        long incidencesCount = 0;

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (MaterialStatus status : MaterialStatus.values()) {
            statusCounts.put(status.name(), 0L);
        }

        for (Material m : allMaterials) {
            // Count status for all materials (both active and inactive)
            statusCounts.put(m.getStatus().name(), statusCounts.get(m.getStatus().name()) + 1);

            if (m.isActive()) {
                totalMaterials++;
                if (m.getStatus() == MaterialStatus.ROTO || m.getStatus() == MaterialStatus.EN_REPARACION) {
                    incidencesCount++;
                }
            }
        }

        // 2. Fetch all offices to populate office counts (active offices, default count 0)
        List<Office> offices = officeRepository.findAll();
        Map<String, OfficeCountDto> officeCountMap = new LinkedHashMap<>();
        for (Office office : offices) {
            if (office.isActive()) {
                officeCountMap.put(office.getPublicId(), new OfficeCountDto(office.getPublicId(), office.getName(), 0L));
            }
        }

        for (Material m : allMaterials) {
            if (m.isActive() && m.getOffice() != null) {
                OfficeCountDto dto = officeCountMap.get(m.getOffice().getPublicId());
                if (dto != null) {
                    dto.setCount(dto.getCount() + 1);
                }
            }
        }
        List<OfficeCountDto> officeCounts = new ArrayList<>(officeCountMap.values());

        // 3. Calculate mean repair time from material history status transitions
        Specification<MaterialHistory> spec = (root, query, cb) -> cb.or(
                cb.equal(root.get("newStatus"), MaterialStatus.EN_REPARACION),
                cb.equal(root.get("previousStatus"), MaterialStatus.EN_REPARACION)
        );

        List<MaterialHistory> transitions = materialHistoryRepository.findAll(
                spec,
                Sort.by(Sort.Direction.ASC, "createdAt", "id")
        );

        double totalHours = 0.0;
        long completedRepairsCount = 0;

        // Group transitions by material ID
        Map<Long, List<MaterialHistory>> transitionsByMaterial = transitions.stream()
                .collect(Collectors.groupingBy(mh -> mh.getMaterial().getId()));

        for (Map.Entry<Long, List<MaterialHistory>> entry : transitionsByMaterial.entrySet()) {
            List<MaterialHistory> historyList = entry.getValue();
            // Sort chronologically
            historyList.sort(Comparator.comparing(MaterialHistory::getCreatedAt).thenComparing(MaterialHistory::getId));

            LocalDateTime repairStart = null;
            for (MaterialHistory mh : historyList) {
                if (mh.getNewStatus() == MaterialStatus.EN_REPARACION) {
                    repairStart = mh.getCreatedAt();
                } else if (mh.getPreviousStatus() == MaterialStatus.EN_REPARACION
                        && mh.getNewStatus() != MaterialStatus.EN_REPARACION) {
                    if (repairStart != null) {
                        double hours = Duration.between(repairStart, mh.getCreatedAt()).toSeconds() / 3600.0;
                        totalHours += hours;
                        completedRepairsCount++;
                        repairStart = null; // Reset
                    }
                }
            }
        }

        Double meanRepairTimeInHours = completedRepairsCount > 0 ? (totalHours / completedRepairsCount) : 0.0;

        // Calculate Workstation KPIs
        long totalComplete = 0;
        long totalPartial = 0;
        long totalSpecial = 0;
        long leftoverMonitors = 0;
        long leftoverKeyboards = 0;
        long leftoverMice = 0;
        long leftoverHeadphones = 0;

        Map<String, List<Material>> operationalMaterialsByOffice = allMaterials.stream()
                .filter(m -> m.isActive() && m.getStatus() == MaterialStatus.OPERATIVO && m.getOffice() != null && m.getOffice().getPublicId() != null)
                .collect(Collectors.groupingBy(m -> m.getOffice().getPublicId()));

        for (Map.Entry<String, List<Material>> entry : operationalMaterialsByOffice.entrySet()) {
            List<Material> officeMaterials = entry.getValue();
            long monitors = 0;
            long keyboards = 0;
            long mice = 0;
            long headphones = 0;

            for (Material m : officeMaterials) {
                String type = m.getMaterialType() != null ? m.getMaterialType().trim().toUpperCase() : "";
                type = type.replace("Ó", "O").replace("Í", "I").replace("Á", "A").replace("É", "E").replace("Ú", "U");
                if (type.contains("MONITOR")) {
                    monitors++;
                } else if (type.contains("TECLADO")) {
                    keyboards++;
                } else if (type.contains("RATON")) {
                    mice++;
                } else if (type.contains("AUDIFONO")) {
                    headphones++;
                }
            }

            // 1. Special: 2 monitors, 1 keyboard, 1 mouse, 1 headphone
            long special = Math.min(monitors / 2, Math.min(keyboards, Math.min(mice, headphones)));
            monitors -= special * 2;
            keyboards -= special;
            mice -= special;
            headphones -= special;

            // 2. Complete: 1 monitor, 1 keyboard, 1 mouse, 2 headphones
            long complete = Math.min(monitors, Math.min(keyboards, Math.min(mice, headphones / 2)));
            monitors -= complete;
            keyboards -= complete;
            mice -= complete;
            headphones -= complete * 2;

            // 3. Partial: 1 monitor, 1 keyboard, 1 mouse, 1 headphone
            long partial = Math.min(monitors, Math.min(keyboards, Math.min(mice, headphones)));
            monitors -= partial;
            keyboards -= partial;
            mice -= partial;
            headphones -= partial;

            // Accumulate leftovers
            leftoverMonitors += monitors;
            leftoverKeyboards += keyboards;
            leftoverMice += mice;
            leftoverHeadphones += headphones;

            totalSpecial += special;
            totalComplete += complete;
            totalPartial += partial;
        }

        Map<String, Long> materialTypeCounts = new LinkedHashMap<>();
        for (Material m : allMaterials) {
            if (m.isActive()) {
                String type = m.getMaterialType() != null ? m.getMaterialType().trim().toUpperCase() : "OTRO";
                materialTypeCounts.put(type, materialTypeCounts.getOrDefault(type, 0L) + 1);
            }
        }

        return new DashboardKpisResponse(
                totalMaterials,
                statusCounts,
                officeCounts,
                incidencesCount,
                meanRepairTimeInHours,
                totalComplete,
                totalPartial,
                totalSpecial,
                leftoverMonitors,
                leftoverKeyboards,
                leftoverMice,
                leftoverHeadphones,
                materialTypeCounts
        );
    }
}
