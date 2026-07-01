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
    private long leftoverMonitors;
    private long leftoverKeyboards;
    private long leftoverMice;
    private long leftoverHeadphones;
    private Map<String, Long> materialTypeCounts;

    public DashboardKpisResponse() {
    }

    public DashboardKpisResponse(long totalMaterials, Map<String, Long> statusCounts, List<OfficeCountDto> officeCounts, long incidencesCount, Double meanRepairTimeInHours, long completeWorkstations, long partialWorkstations, long specialWorkstations, long leftoverMonitors, long leftoverKeyboards, long leftoverMice, long leftoverHeadphones, Map<String, Long> materialTypeCounts) {
        this.totalMaterials = totalMaterials;
        this.statusCounts = statusCounts;
        this.officeCounts = officeCounts;
        this.incidencesCount = incidencesCount;
        this.meanRepairTimeInHours = meanRepairTimeInHours;
        this.completeWorkstations = completeWorkstations;
        this.partialWorkstations = partialWorkstations;
        this.specialWorkstations = specialWorkstations;
        this.leftoverMonitors = leftoverMonitors;
        this.leftoverKeyboards = leftoverKeyboards;
        this.leftoverMice = leftoverMice;
        this.leftoverHeadphones = leftoverHeadphones;
        this.materialTypeCounts = materialTypeCounts;
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

    public long getLeftoverMonitors() {
        return leftoverMonitors;
    }

    public void setLeftoverMonitors(long leftoverMonitors) {
        this.leftoverMonitors = leftoverMonitors;
    }

    public long getLeftoverKeyboards() {
        return leftoverKeyboards;
    }

    public void setLeftoverKeyboards(long leftoverKeyboards) {
        this.leftoverKeyboards = leftoverKeyboards;
    }

    public long getLeftoverMice() {
        return leftoverMice;
    }

    public void setLeftoverMice(long leftoverMice) {
        this.leftoverMice = leftoverMice;
    }

    public long getLeftoverHeadphones() {
        return leftoverHeadphones;
    }

    public void setLeftoverHeadphones(long leftoverHeadphones) {
        this.leftoverHeadphones = leftoverHeadphones;
    }

    public Map<String, Long> getMaterialTypeCounts() {
        return materialTypeCounts;
    }

    public void setMaterialTypeCounts(Map<String, Long> materialTypeCounts) {
        this.materialTypeCounts = materialTypeCounts;
    }
}
