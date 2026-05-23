package com.vdenergy.inventory.materials.dto;

import com.vdenergy.inventory.common.entity.MaterialStatus;
import com.vdenergy.inventory.materials.entity.Material;
import com.vdenergy.inventory.offices.dto.OfficeResponse;

import java.time.LocalDateTime;

public class MaterialResponse {
    private String publicCode;
    private String materialType;
    private String brand;
    private String model;
    private String serialNumber;
    private OfficeResponse office;
    private MaterialStatus status;
    private LocalDateTime qrGeneratedAt;
    private Integer qrVersion;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MaterialResponse() {
    }

    public MaterialResponse(Material material) {
        this.publicCode = material.getPublicCode();
        this.materialType = material.getMaterialType();
        this.brand = material.getBrand();
        this.model = material.getModel();
        this.serialNumber = material.getSerialNumber();
        if (material.getOffice() != null) {
            this.office = new OfficeResponse(material.getOffice());
        }
        this.status = material.getStatus();
        this.qrGeneratedAt = material.getQrGeneratedAt();
        this.qrVersion = material.getQrVersion();
        this.active = material.isActive();
        this.createdAt = material.getCreatedAt();
        this.updatedAt = material.getUpdatedAt();
    }

    // Getters and Setters
    public String getPublicCode() {
        return publicCode;
    }

    public void setPublicCode(String publicCode) {
        this.publicCode = publicCode;
    }

    public String getMaterialType() {
        return materialType;
    }

    public void setMaterialType(String materialType) {
        this.materialType = materialType;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public OfficeResponse getOffice() {
        return office;
    }

    public void setOffice(OfficeResponse office) {
        this.office = office;
    }

    public MaterialStatus getStatus() {
        return status;
    }

    public void setStatus(MaterialStatus status) {
        this.status = status;
    }

    public LocalDateTime getQrGeneratedAt() {
        return qrGeneratedAt;
    }

    public void setQrGeneratedAt(LocalDateTime qrGeneratedAt) {
        this.qrGeneratedAt = qrGeneratedAt;
    }

    public Integer getQrVersion() {
        return qrVersion;
    }

    public void setQrVersion(Integer qrVersion) {
        this.qrVersion = qrVersion;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
