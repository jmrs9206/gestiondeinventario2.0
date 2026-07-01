package com.stockflow.inventory.inventory.controller;

import com.stockflow.inventory.common.responses.ApiPageResponse;
import com.stockflow.inventory.common.responses.ApiResponse;
import com.stockflow.inventory.inventory.dto.MaterialHistoryResponse;
import com.stockflow.inventory.inventory.service.MaterialHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@PreAuthorize("hasAuthority('READ_MATERIAL_HISTORY')")
public class MaterialHistoryController {

    private final MaterialHistoryService materialHistoryService;

    public MaterialHistoryController(MaterialHistoryService materialHistoryService) {
        this.materialHistoryService = materialHistoryService;
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<ApiPageResponse<MaterialHistoryResponse>>> getGeneralHistory(
            @RequestParam(required = false) String materialPublicCode,
            @RequestParam(required = false) String action,
            Pageable pageable
    ) {
        Page<MaterialHistoryResponse> page = materialHistoryService.getHistory(materialPublicCode, action, pageable);
        return ResponseEntity.ok(new ApiResponse<>(new ApiPageResponse<>(page)));
    }

    @GetMapping("/materials/{publicCode}/history")
    public ResponseEntity<ApiResponse<ApiPageResponse<MaterialHistoryResponse>>> getMaterialSpecificHistory(
            @PathVariable String publicCode,
            Pageable pageable
    ) {
        Page<MaterialHistoryResponse> page = materialHistoryService.getHistory(publicCode, null, pageable);
        return ResponseEntity.ok(new ApiResponse<>(new ApiPageResponse<>(page)));
    }
}
