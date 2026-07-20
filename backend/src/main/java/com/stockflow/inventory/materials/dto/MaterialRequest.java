package com.stockflow.inventory.materials.dto;

import com.stockflow.inventory.common.entity.MaterialStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class MaterialRequest {

    @NotBlank(message = "Material type is mandatory")
    @Size(max = 80, message = "Material type cannot exceed 80 characters")
    private String materialType;

    @Size(max = 120, message = "Brand cannot exceed 120 characters")
    private String brand;

    @Size(max = 120, message = "Model cannot exceed 120 characters")
    private String model;

    @Size(max = 160, message = "Serial number cannot exceed 160 characters")
    private String serialNumber;

    @NotBlank(message = "Office public ID is mandatory")
    @Size(max = 64, message = "Office public ID cannot exceed 64 characters")
    private String officePublicId;

    @NotNull(message = "Status is mandatory")
    private MaterialStatus status;

    @NotBlank(message = "Comment is mandatory")
    private String comment;

    private BigDecimal purchasePrice;

    private LocalDate purchaseDate;

    // Getters and Setters
    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
    public String getMaterialType() {
        return materialType;
    }

    public void setMaterialType(String materialType) {
        this.materialType = com.stockflow.inventory.common.utils.TextNormalizer.normalize(materialType);
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = com.stockflow.inventory.common.utils.TextNormalizer.normalize(brand);
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = com.stockflow.inventory.common.utils.TextNormalizer.normalize(model);
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = com.stockflow.inventory.common.utils.TextNormalizer.normalize(serialNumber);
    }

    public String getOfficePublicId() {
        return officePublicId;
    }

    public void setOfficePublicId(String officePublicId) {
        this.officePublicId = officePublicId;
    }

    public MaterialStatus getStatus() {
        return status;
    }

    public void setStatus(MaterialStatus status) {
        this.status = status;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = com.stockflow.inventory.common.utils.TextNormalizer.normalize(comment);
    }
}
