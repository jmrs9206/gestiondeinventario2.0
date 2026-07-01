package com.stockflow.inventory.dashboard.controller;

import com.stockflow.inventory.common.responses.ApiResponse;
import com.stockflow.inventory.dashboard.dto.DashboardKpisResponse;
import com.stockflow.inventory.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@PreAuthorize("hasAuthority('READ_DASHBOARD')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<DashboardKpisResponse>> getKpis() {
        DashboardKpisResponse kpis = dashboardService.getKpis();
        return ResponseEntity.ok(new ApiResponse<>(kpis));
    }
}
