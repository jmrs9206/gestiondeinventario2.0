package com.stockflow.inventory.materials.entity;

import com.stockflow.inventory.common.entity.BaseEntity;
import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.offices.entity.Office;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
public class Material extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_code", nullable = false, unique = true, length = 80)
    private String publicCode;

    @Column(name = "material_type", nullable = false, length = 80)
    private String materialType;

    @Column(name = "brand", length = 120)
    private String brand;

    @Column(name = "model", length = 120)
    private String model;

    @Column(name = "serial_number", length = 160)
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    private Office office;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MaterialStatus status;

    @Column(name = "qr_generated_at")
    private LocalDateTime qrGeneratedAt;

    @Column(name = "qr_version", nullable = false)
    private Integer qrVersion = 1;

    // Constructors
    public Material() {
    }

    public Material(String publicCode, String materialType, String brand, String model, String serialNumber, Office office, MaterialStatus status) {
        this.publicCode = publicCode;
        this.materialType = materialType;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.office = office;
        this.status = status;
        this.qrVersion = 1;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPublicCode() {
        return publicCode;
    }

    public void setPublicCode(String publicCode) {
        this.publicCode = com.stockflow.inventory.common.utils.TextNormalizer.normalize(publicCode);
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

    public Office getOffice() {
        return office;
    }

    public void setOffice(Office office) {
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

}
