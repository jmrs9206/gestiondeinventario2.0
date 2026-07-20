package com.stockflow.inventory.users.controller;

import com.stockflow.inventory.common.responses.ApiPageResponse;
import com.stockflow.inventory.common.responses.ApiResponse;
import com.stockflow.inventory.users.dto.*;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.service.UserService;
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
@RequestMapping("/api/v1/users")
@PreAuthorize("hasAuthority('READ_USER')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_USER')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        UserResponse response = userService.createUser(request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ApiPageResponse<UserResponse>>> listUsers(Pageable pageable) {
        Page<UserResponse> page = userService.listUsers(pageable);
        return ResponseEntity.ok(new ApiResponse<>(new ApiPageResponse<>(page)));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable String publicId) {
        UserResponse response = userService.getUserByPublicId(publicId);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String publicId,
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        UserResponse response = userService.updateUser(publicId, request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PatchMapping("/{publicId}/status")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<ApiResponse<UserResponse>> changeStatus(
            @PathVariable String publicId,
            @Valid @RequestBody UserStatusRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        UserResponse response = userService.changeUserStatus(publicId, request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PutMapping("/{publicId}/password")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<ApiResponse<UserResponse>> changePassword(
            @PathVariable String publicId,
            @Valid @RequestBody UserPasswordRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        UserResponse response = userService.changePassword(publicId, request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PostMapping("/{publicId}/password-reset")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<ApiResponse<UserResponse>> sendPasswordReset(
            @PathVariable String publicId,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        UserResponse response = userService.sendPasswordResetEmail(publicId, performer.getPublicId(), ip, userAgent);
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
