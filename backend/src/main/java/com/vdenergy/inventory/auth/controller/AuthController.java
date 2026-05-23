package com.vdenergy.inventory.auth.controller;

import com.vdenergy.inventory.auth.dto.*;
import com.vdenergy.inventory.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest loginRequest,
            HttpServletRequest request
    ) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        LoginResponse response = authService.login(loginRequest.getEmail(), loginRequest.getPassword(), ip, userAgent);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @RequestBody RefreshRequest refreshRequest,
            HttpServletRequest request
    ) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        LoginResponse response = authService.refresh(refreshRequest.getRefreshToken(), ip, userAgent);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody LogoutRequest logoutRequest,
            HttpServletRequest request
    ) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        authService.logout(logoutRequest.getRefreshToken(), ip, userAgent);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> adminOnly() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome Admin");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tecnico-only")
    @PreAuthorize("hasRole('TECNICO')")
    public ResponseEntity<Map<String, String>> tecnicoOnly() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome Tecnico");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/authenticated")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<Map<String, String>> authenticated() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome Authenticated");
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", ex.getMessage());
        body.put("path", request.getRequestURI());
        return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(body);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
