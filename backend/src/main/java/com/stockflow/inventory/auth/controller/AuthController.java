package com.stockflow.inventory.auth.controller;

import com.stockflow.inventory.auth.dto.*;
import com.stockflow.inventory.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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
    private final com.stockflow.inventory.auth.service.TokenBlacklistService tokenBlacklistService;
    private final com.stockflow.inventory.auth.service.JwtService jwtService;

    public AuthController(
            AuthService authService,
            com.stockflow.inventory.auth.service.TokenBlacklistService tokenBlacklistService,
            com.stockflow.inventory.auth.service.JwtService jwtService
    ) {
        this.authService = authService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        LoginResponse loginResponse = authService.login(loginRequest.getEmail(), loginRequest.getPassword(), ip, userAgent);
        
        String token = loginResponse.getRefreshToken();
        // Remove token from JSON body for 10/10 security (XSS protection)
        loginResponse.setRefreshToken(null);
        
        setRefreshTokenCookie(response, token, 7 * 24 * 60 * 60);
        
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @RequestBody(required = false) RefreshRequest refreshRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        String token = null;
        if (refreshRequest != null && refreshRequest.getRefreshToken() != null && !refreshRequest.getRefreshToken().isEmpty()) {
            token = refreshRequest.getRefreshToken();
        } else {
            token = getCookieValue(request, "refreshToken");
        }
        
        if (token == null || token.isEmpty()) {
            throw new BadCredentialsException("Refresh token is missing");
        }
        
        LoginResponse loginResponse = authService.refresh(token, ip, userAgent);
        
        String newToken = loginResponse.getRefreshToken();
        // Remove token from JSON body for 10/10 security (XSS protection)
        loginResponse.setRefreshToken(null);
        
        setRefreshTokenCookie(response, newToken, 7 * 24 * 60 * 60);
        
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody(required = false) LogoutRequest logoutRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        String token = null;
        if (logoutRequest != null && logoutRequest.getRefreshToken() != null && !logoutRequest.getRefreshToken().isEmpty()) {
            token = logoutRequest.getRefreshToken();
        } else {
            token = getCookieValue(request, "refreshToken");
        }
        
        if (token != null && !token.isEmpty()) {
            authService.logout(token, ip, userAgent);
        }

        // Blacklist current access token if present in Authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            long expTime = jwtService.extractExpirationTimeMs(accessToken);
            tokenBlacklistService.blacklistToken(accessToken, expTime);
        }
        
        clearRefreshTokenCookie(response);
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept-invitation")
    public ResponseEntity<Map<String, String>> acceptInvitation(
            @RequestBody AcceptInvitationRequest request
    ) {
        authService.acceptInvitation(request.getEmail(), request.getToken(), request.getPassword());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Contraseña configurada con éxito. Ya puedes iniciar sesión.");
        return ResponseEntity.ok(response);
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

    private void setRefreshTokenCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (name.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
