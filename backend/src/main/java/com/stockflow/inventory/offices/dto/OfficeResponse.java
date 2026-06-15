package com.stockflow.inventory.offices.dto;

import com.stockflow.inventory.offices.entity.Office;
import java.time.LocalDateTime;

public class OfficeResponse {
    private String publicId;
    private String name;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OfficeResponse() {
    }

    public OfficeResponse(Office office) {
        this.publicId = office.getPublicId();
        this.name = office.getName();
        this.active = office.isActive();
        this.createdAt = office.getCreatedAt();
        this.updatedAt = office.getUpdatedAt();
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
