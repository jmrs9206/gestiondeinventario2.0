package com.stockflow.inventory.audit.controller;

import com.stockflow.inventory.audit.dto.AuditLogResponse;
import com.stockflow.inventory.audit.entity.AuditLog;
import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.common.responses.ApiPageResponse;
import com.stockflow.inventory.common.responses.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ApiPageResponse<AuditLogResponse>>> getAuditLogs(Pageable pageable) {
        Page<AuditLog> logs = auditService.getAuditLogs(pageable);
        Page<AuditLogResponse> responsePage = logs.map(log -> {
            AuditLogResponse dto = new AuditLogResponse();
            dto.setEntityType(log.getEntityType());
            dto.setEntityId(log.getEntityId());
            dto.setAction(log.getAction());
            dto.setOldValue(log.getOldValue());
            dto.setNewValue(log.getNewValue());
            dto.setPerformedByType(log.getPerformedByType());
            dto.setPerformedById(log.getPerformedById());
            dto.setIpAddress(log.getIpAddress());
            dto.setUserAgent(log.getUserAgent());
            dto.setCreatedAt(log.getCreatedAt());
            return dto;
        });
        return ResponseEntity.ok(new ApiResponse<>(new ApiPageResponse<>(responsePage)));
    }
}
