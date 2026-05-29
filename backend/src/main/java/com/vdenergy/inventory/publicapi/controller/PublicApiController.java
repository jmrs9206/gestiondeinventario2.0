package com.vdenergy.inventory.publicapi.controller;

import com.vdenergy.inventory.common.entity.MaterialStatus;
import com.vdenergy.inventory.common.responses.ApiPageResponse;
import com.vdenergy.inventory.common.responses.ApiResponse;
import com.vdenergy.inventory.materials.dto.MaterialResponse;
import com.vdenergy.inventory.materials.service.MaterialService;
import com.vdenergy.inventory.publicapi.entity.ApiClient;
import com.vdenergy.inventory.users.dto.UserCreateRequest;
import com.vdenergy.inventory.users.dto.UserResponse;
import com.vdenergy.inventory.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public-api")
public class PublicApiController {

    private final UserService userService;
    private final MaterialService materialService;

    public PublicApiController(UserService userService, MaterialService materialService) {
        this.userService = userService;
        this.materialService = materialService;
    }

    @PostMapping("/v1/users")
    @PreAuthorize("hasAuthority('SCOPE_users:create')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request,
            HttpServletRequest servletRequest
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ApiClient client = (ApiClient) auth.getPrincipal();

        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");

        UserResponse response = userService.createUser(request, client.getPublicId(), ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(response));
    }

    @GetMapping("/v1/materials")
    @PreAuthorize("hasAuthority('SCOPE_materials:read')")
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

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
