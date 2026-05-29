package com.vdenergy.inventory.audit.dto;

import java.time.LocalDateTime;

public class AuditLogResponse {
    private String entityType;
    private String entityId;
    private String action;
    private String oldValue;
    private String newValue;
    private String performedByType;
    private String performedById;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;

    public AuditLogResponse() {
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public String getPerformedByType() {
        return performedByType;
    }

    public void setPerformedByType(String performedByType) {
        this.performedByType = performedByType;
    }

    public String getPerformedById() {
        return performedById;
    }

    public void setPerformedById(String performedById) {
        this.performedById = performedById;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
