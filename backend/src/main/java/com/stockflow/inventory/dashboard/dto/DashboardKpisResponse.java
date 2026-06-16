package com.stockflow.inventory.dashboard.dto;

import java.util.List;
import java.util.Map;

public class DashboardKpisResponse {
    private long totalMaterials;
    private Map<String, Long> statusCounts;
    private List<OfficeCountDto> officeCounts;
    private long incidencesCount;
    private Double meanRepairTimeInHours;
    private long completeWorkstations;
    private long partialWorkstations;
    private long specialWorkstations;

    public DashboardKpisResponse() {
    }

    public DashboardKpisResponse(long totalMaterials, Map<String, Long> statusCounts, List<OfficeCountDto> officeCounts, long incidencesCount, Double meanRepairTimeInHours, long completeWorkstations, long partialWorkstations, long specialWorkstations) {
        this.totalMaterials = totalMaterials;
        this.statusCounts = statusCounts;
        this.officeCounts = officeCounts;
        this.incidencesCount = incidencesCount;
        this.meanRepairTimeInHours = meanRepairTimeInHours;
        this.completeWorkstations = completeWorkstations;
        this.partialWorkstations = partialWorkstations;
        this.specialWorkstations = specialWorkstations;
    }

    public long getTotalMaterials() {
        return totalMaterials;
    }

    public void setTotalMaterials(long totalMaterials) {
        this.totalMaterials = totalMaterials;
    }

    public Map<String, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public List<OfficeCountDto> getOfficeCounts() {
        return officeCounts;
    }

    public void setOfficeCounts(List<OfficeCountDto> officeCounts) {
        this.officeCounts = officeCounts;
    }

    public long getIncidencesCount() {
        return incidencesCount;
    }

    public void setIncidencesCount(long incidencesCount) {
        this.incidencesCount = incidencesCount;
    }

    public Double getMeanRepairTimeInHours() {
        return meanRepairTimeInHours;
    }

    public void setMeanRepairTimeInHours(Double meanRepairTimeInHours) {
        this.meanRepairTimeInHours = meanRepairTimeInHours;
    }

    public long getCompleteWorkstations() {
        return completeWorkstations;
    }

    public void setCompleteWorkstations(long completeWorkstations) {
        this.completeWorkstations = completeWorkstations;
    }

    public long getPartialWorkstations() {
        return partialWorkstations;
    }

    public void setPartialWorkstations(long partialWorkstations) {
        this.partialWorkstations = partialWorkstations;
    }

    public long getSpecialWorkstations() {
        return specialWorkstations;
    }

    public void setSpecialWorkstations(long specialWorkstations) {
        this.specialWorkstations = specialWorkstations;
    }
}
