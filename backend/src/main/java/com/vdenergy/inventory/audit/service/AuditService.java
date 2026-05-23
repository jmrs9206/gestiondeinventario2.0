package com.vdenergy.inventory.audit.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    public void logEvent(String entityType, String entityId, String action, String performedByType, String performedById, String ipAddress, String userAgent) {
        log.info("AUDIT LOG: entityType={}, entityId={}, action={}, performedByType={}, performedById={}, ip={}, userAgent={}",
                entityType, entityId, action, performedByType, performedById, ipAddress, userAgent);
    }
}
