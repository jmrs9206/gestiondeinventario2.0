package com.vdenergy.inventory.dashboard.service;

import com.vdenergy.inventory.common.entity.MaterialStatus;
import com.vdenergy.inventory.dashboard.dto.DashboardKpisResponse;
import com.vdenergy.inventory.dashboard.dto.OfficeCountDto;
import com.vdenergy.inventory.inventory.entity.MaterialHistory;
import com.vdenergy.inventory.inventory.repository.MaterialHistoryRepository;
import com.vdenergy.inventory.materials.entity.Material;
import com.vdenergy.inventory.materials.repository.MaterialRepository;
import com.vdenergy.inventory.offices.entity.Office;
import com.vdenergy.inventory.offices.repository.OfficeRepository;
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

        return new DashboardKpisResponse(
                totalMaterials,
                statusCounts,
                officeCounts,
                incidencesCount,
                meanRepairTimeInHours
        );
    }
}
