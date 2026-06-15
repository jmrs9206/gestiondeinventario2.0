package com.stockflow.inventory.inventory.dto;

import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.inventory.entity.MaterialHistory;

import java.time.LocalDateTime;

public class MaterialHistoryResponse {
    private Long id;
    private String materialPublicCode;
    private String action;
    private MaterialStatus previousStatus;
    private MaterialStatus newStatus;
    private String previousOfficePublicId;
    private String previousOfficeName;
    private String newOfficePublicId;
    private String newOfficeName;
    private String comment;
    private String performedByUserEmail;
    private String performedByUserFullName;
    private LocalDateTime createdAt;

    public MaterialHistoryResponse() {
    }

    public MaterialHistoryResponse(MaterialHistory history) {
        this.id = history.getId();
        if (history.getMaterial() != null) {
            this.materialPublicCode = history.getMaterial().getPublicCode();
        }
        this.action = history.getAction();
        this.previousStatus = history.getPreviousStatus();
        this.newStatus = history.getNewStatus();
        if (history.getPreviousOffice() != null) {
            this.previousOfficePublicId = history.getPreviousOffice().getPublicId();
            this.previousOfficeName = history.getPreviousOffice().getName();
        }
        if (history.getNewOffice() != null) {
            this.newOfficePublicId = history.getNewOffice().getPublicId();
            this.newOfficeName = history.getNewOffice().getName();
        }
        this.comment = history.getComment();
        if (history.getPerformedByUser() != null) {
            this.performedByUserEmail = history.getPerformedByUser().getEmail();
            this.performedByUserFullName = history.getPerformedByUser().getFirstName() + " " + history.getPerformedByUser().getLastName();
        }
        this.createdAt = history.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMaterialPublicCode() {
        return materialPublicCode;
    }

    public void setMaterialPublicCode(String materialPublicCode) {
        this.materialPublicCode = materialPublicCode;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public MaterialStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(MaterialStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public MaterialStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(MaterialStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getPreviousOfficePublicId() {
        return previousOfficePublicId;
    }

    public void setPreviousOfficePublicId(String previousOfficePublicId) {
        this.previousOfficePublicId = previousOfficePublicId;
    }

    public String getPreviousOfficeName() {
        return previousOfficeName;
    }

    public void setPreviousOfficeName(String previousOfficeName) {
        this.previousOfficeName = previousOfficeName;
    }

    public String getNewOfficePublicId() {
        return newOfficePublicId;
    }

    public void setNewOfficePublicId(String newOfficePublicId) {
        this.newOfficePublicId = newOfficePublicId;
    }

    public String getNewOfficeName() {
        return newOfficeName;
    }

    public void setNewOfficeName(String newOfficeName) {
        this.newOfficeName = newOfficeName;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getPerformedByUserEmail() {
        return performedByUserEmail;
    }

    public void setPerformedByUserEmail(String performedByUserEmail) {
        this.performedByUserEmail = performedByUserEmail;
    }

    public String getPerformedByUserFullName() {
        return performedByUserFullName;
    }

    public void setPerformedByUserFullName(String performedByUserFullName) {
        this.performedByUserFullName = performedByUserFullName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
