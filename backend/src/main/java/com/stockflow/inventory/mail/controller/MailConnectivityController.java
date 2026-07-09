package com.stockflow.inventory.mail.controller;

import com.stockflow.inventory.common.responses.ApiResponse;
import com.stockflow.inventory.mail.dto.MailConnectionStatus;
import com.stockflow.inventory.mail.service.MailConnectivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mail")
@PreAuthorize("hasRole('ADMIN')")
public class MailConnectivityController {

    private final MailConnectivityService mailConnectivityService;

    public MailConnectivityController(MailConnectivityService mailConnectivityService) {
        this.mailConnectivityService = mailConnectivityService;
    }

    @GetMapping("/connectivity")
    public ResponseEntity<ApiResponse<List<MailConnectionStatus>>> verifyConnectivity() {
        return ResponseEntity.ok(new ApiResponse<>(mailConnectivityService.verifyConnections()));
    }
}
