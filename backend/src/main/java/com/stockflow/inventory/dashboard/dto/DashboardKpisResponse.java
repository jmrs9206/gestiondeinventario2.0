package com.stockflow.inventory.dashboard.dto;

import java.math.BigDecimal;
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

    // New professional KPIs
    private BigDecimal totalAcquisitionCost;
    private BigDecimal totalCurrentValue;
    private BigDecimal totalDepreciation;
    private List<String> systemAlerts;
    private Map<String, BigDecimal> officeCosts;

    public DashboardKpisResponse() {
    }

    public DashboardKpisResponse(long totalMaterials, Map<String, Long> statusCounts, List<OfficeCountDto> officeCounts, long incidencesCount, Double meanRepairTimeInHours, long completeWorkstations, long partialWorkstations, long specialWorkstations, long leftoverMonitors, long leftoverKeyboards, long leftoverMice, long leftoverHeadphones, Map<String, Long> materialTypeCounts, BigDecimal totalAcquisitionCost, BigDecimal totalCurrentValue, BigDecimal totalDepreciation, List<String> systemAlerts, Map<String, BigDecimal> officeCosts) {
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
        this.totalAcquisitionCost = totalAcquisitionCost;
        this.totalCurrentValue = totalCurrentValue;
        this.totalDepreciation = totalDepreciation;
        this.systemAlerts = systemAlerts;
        this.officeCosts = officeCosts;
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

    public BigDecimal getTotalAcquisitionCost() {
        return totalAcquisitionCost;
    }

    public void setTotalAcquisitionCost(BigDecimal totalAcquisitionCost) {
        this.totalAcquisitionCost = totalAcquisitionCost;
    }

    public BigDecimal getTotalCurrentValue() {
        return totalCurrentValue;
    }

    public void setTotalCurrentValue(BigDecimal totalCurrentValue) {
        this.totalCurrentValue = totalCurrentValue;
    }

    public BigDecimal getTotalDepreciation() {
        return totalDepreciation;
    }

    public void setTotalDepreciation(BigDecimal totalDepreciation) {
        this.totalDepreciation = totalDepreciation;
    }

    public List<String> getSystemAlerts() {
        return systemAlerts;
    }

    public void setSystemAlerts(List<String> systemAlerts) {
        this.systemAlerts = systemAlerts;
    }

    public Map<String, BigDecimal> getOfficeCosts() {
        return officeCosts;
    }

    public void setOfficeCosts(Map<String, BigDecimal> officeCosts) {
        this.officeCosts = officeCosts;
    }
}
