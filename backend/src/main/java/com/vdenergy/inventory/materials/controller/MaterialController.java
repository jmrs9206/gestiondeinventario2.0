package com.vdenergy.inventory.materials.controller;

import com.vdenergy.inventory.common.entity.MaterialStatus;
import com.vdenergy.inventory.common.responses.ApiPageResponse;
import com.vdenergy.inventory.common.responses.ApiResponse;
import com.vdenergy.inventory.materials.dto.MaterialRequest;
import com.vdenergy.inventory.materials.dto.MaterialResponse;
import com.vdenergy.inventory.materials.service.MaterialService;
import com.vdenergy.inventory.users.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/materials")
@PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MaterialResponse>> createMaterial(
            @Valid @RequestBody MaterialRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        MaterialResponse response = materialService.createMaterial(request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ApiPageResponse<MaterialResponse>>> listMaterials(
            @RequestParam(required = false) MaterialStatus status,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) String officePublicId,
            @RequestParam(required = false) String serialNumber,
            Pageable pageable
    ) {
        Page<MaterialResponse> page = materialService.listMaterials(status, materialType, officePublicId, serialNumber, pageable);
        return ResponseEntity.ok(new ApiResponse<>(new ApiPageResponse<>(page)));
    }

    @GetMapping("/{publicCode}")
    public ResponseEntity<ApiResponse<MaterialResponse>> getMaterial(@PathVariable String publicCode) {
        MaterialResponse response = materialService.getMaterialByPublicCode(publicCode);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PutMapping("/{publicCode}")
    public ResponseEntity<ApiResponse<MaterialResponse>> updateMaterial(
            @PathVariable String publicCode,
            @Valid @RequestBody MaterialRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        MaterialResponse response = materialService.updateMaterial(publicCode, request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @DeleteMapping("/{publicCode}")
    public ResponseEntity<ApiResponse<MaterialResponse>> deleteMaterial(
            @PathVariable String publicCode,
            @RequestParam(required = false) String comment,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        MaterialResponse response = materialService.decommissionMaterial(publicCode, comment, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
