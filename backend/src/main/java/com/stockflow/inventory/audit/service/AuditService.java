package com.stockflow.inventory.audit.service;

import com.stockflow.inventory.audit.entity.AuditLog;
import com.stockflow.inventory.audit.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.stockflow.inventory.publicapi.entity.ApiClient;
import com.stockflow.inventory.users.entity.User;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(String entityType, String entityId, String action, String performedByType, String performedById, String ipAddress, String userAgent) {
        logEvent(entityType, entityId, action, performedByType, performedById, ipAddress, userAgent, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(String entityType, String entityId, String action, String performedByType, String performedById, String ipAddress, String userAgent, String oldValue, String newValue) {
        try {
            String actualPerformedByType = performedByType;
            String actualPerformedById = performedById;

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                Object principal = auth.getPrincipal();
                if (principal instanceof ApiClient client) {
                    actualPerformedByType = "API_CLIENT";
                    actualPerformedById = client.getPublicId();
                } else if (principal instanceof User user) {
                    actualPerformedByType = "USER";
                    actualPerformedById = user.getPublicId();
                }
            }

            log.info("AUDIT LOG: entityType={}, entityId={}, action={}, performedByType={}, performedById={}, ip={}, userAgent={}, oldValue={}, newValue={}",
                    entityType, entityId, action, actualPerformedByType, actualPerformedById, ipAddress, userAgent, oldValue, newValue);

            String truncatedUserAgent = truncate(userAgent, 500);
            String truncatedEntityType = truncate(entityType, 80);
            String truncatedEntityId = truncate(entityId, 120);
            String truncatedAction = truncate(action, 120);
            String truncatedPerformedByType = truncate(actualPerformedByType, 40);
            String truncatedPerformedById = truncate(actualPerformedById, 120);
            String truncatedIpAddress = truncate(ipAddress, 80);

            String cleanOldValue = ensureValidJson(oldValue);
            String cleanNewValue = ensureValidJson(newValue);

            AuditLog auditLog = new AuditLog(
                    truncatedEntityType,
                    truncatedEntityId,
                    truncatedAction,
                    truncatedPerformedByType,
                    truncatedPerformedById,
                    truncatedIpAddress,
                    truncatedUserAgent,
                    cleanOldValue,
                    cleanNewValue
            );

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("TECHNICAL ERROR: Failed to save audit event to database. Event details: entityType={}, entityId={}, action={}. Reason: {}", 
                    entityType, entityId, action, e.getMessage(), e);
        }
    }

    private String ensureValidJson(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || 
            (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
            "null".equals(trimmed) ||
            (trimmed.startsWith("\"") && trimmed.endsWith("\""))) {
            return value;
        }
        // Escape quotes and backslashes, and wrap in double quotes
        String escaped = value.replace("\\", "\\\\").replace("\"", "\\\"");
        return "\"" + escaped + "\"";
    }

    private String truncate(String val, int maxLen) {
        if (val == null) {
            return null;
        }
        return val.length() > maxLen ? val.substring(0, maxLen) : val;
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
}
