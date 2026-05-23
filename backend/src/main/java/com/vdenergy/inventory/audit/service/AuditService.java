package com.vdenergy.inventory.audit.service;

import com.vdenergy.inventory.audit.entity.AuditLog;
import com.vdenergy.inventory.audit.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logEvent(String entityType, String entityId, String action, String performedByType, String performedById, String ipAddress, String userAgent) {
        logEvent(entityType, entityId, action, performedByType, performedById, ipAddress, userAgent, null, null);
    }

    @Transactional
    public void logEvent(String entityType, String entityId, String action, String performedByType, String performedById, String ipAddress, String userAgent, String oldValue, String newValue) {
        log.info("AUDIT LOG: entityType={}, entityId={}, action={}, performedByType={}, performedById={}, ip={}, userAgent={}, oldValue={}, newValue={}",
                entityType, entityId, action, performedByType, performedById, ipAddress, userAgent, oldValue, newValue);

        String truncatedUserAgent = userAgent;
        if (truncatedUserAgent != null && truncatedUserAgent.length() > 500) {
            truncatedUserAgent = truncatedUserAgent.substring(0, 500);
        }

        AuditLog auditLog = new AuditLog(
                entityType,
                entityId,
                action,
                performedByType,
                performedById,
                ipAddress,
                truncatedUserAgent,
                oldValue,
                newValue
        );

        auditLogRepository.save(auditLog);
    }
}
