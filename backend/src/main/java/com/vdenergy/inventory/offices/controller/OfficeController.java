package com.vdenergy.inventory.offices.controller;

import com.vdenergy.inventory.common.responses.ApiPageResponse;
import com.vdenergy.inventory.common.responses.ApiResponse;
import com.vdenergy.inventory.offices.dto.OfficeRequest;
import com.vdenergy.inventory.offices.dto.OfficeResponse;
import com.vdenergy.inventory.offices.service.OfficeService;
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
@RequestMapping("/api/v1/offices")
@PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
public class OfficeController {

    private final OfficeService officeService;

    public OfficeController(OfficeService officeService) {
        this.officeService = officeService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OfficeResponse>> createOffice(
            @Valid @RequestBody OfficeRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        OfficeResponse response = officeService.createOffice(request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ApiPageResponse<OfficeResponse>>> listOffices(Pageable pageable) {
        Page<OfficeResponse> page = officeService.listActiveOffices(pageable);
        return ResponseEntity.ok(new ApiResponse<>(new ApiPageResponse<>(page)));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<OfficeResponse>> getOffice(@PathVariable String publicId) {
        OfficeResponse response = officeService.getOfficeByPublicId(publicId);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<ApiResponse<OfficeResponse>> updateOffice(
            @PathVariable String publicId,
            @Valid @RequestBody OfficeRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        OfficeResponse response = officeService.updateOffice(publicId, request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<ApiResponse<OfficeResponse>> deleteOffice(
            @PathVariable String publicId,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        OfficeResponse response = officeService.deleteOffice(publicId, performer.getPublicId(), ip, userAgent);
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
