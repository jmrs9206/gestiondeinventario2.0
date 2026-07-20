package com.stockflow.inventory.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private final com.stockflow.inventory.users.repository.RolePermissionRepository rolePermissionRepository;

    public JwtService(com.stockflow.inventory.users.repository.RolePermissionRepository rolePermissionRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Value("${jwt.secret}")
    private String secret;

    @Value("${app.security.jwt.expiration-ms:900000}") // Default 15 minutes
    private long expirationMs;

    @jakarta.annotation.PostConstruct
    public void validateSecret() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured! The application cannot start without a secure JWT secret.");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT secret is too short! It must be at least 256 bits (32 bytes) long.");
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private java.util.List<String> getPermissionsForRole(String role) {
        if (rolePermissionRepository == null) {
            return java.util.List.of();
        }
        if (rolePermissionRepository.count() == 0) {
            if ("ADMIN".equals(role)) {
                return java.util.List.of(
                    "CREATE_USER", "READ_USER", "UPDATE_USER", 
                    "CREATE_OFFICE", "UPDATE_OFFICE", 
                    "CREATE_MATERIAL", "UPDATE_MATERIAL", "UPDATE_MATERIAL_STATUS", "READ_MATERIAL_HISTORY",
                    "READ_DASHBOARD", "READ_AUDIT_LOG", "MANAGE_API_CLIENTS", "REGENERATE_QR", "MANAGE_ROLES"
                );
            } else if ("TECNICO".equals(role)) {
                return java.util.List.of(
                    "CREATE_OFFICE", "UPDATE_OFFICE", 
                    "CREATE_MATERIAL", "UPDATE_MATERIAL", "UPDATE_MATERIAL_STATUS", "READ_MATERIAL_HISTORY"
                );
            }
            return java.util.List.of();
        }
        
        return rolePermissionRepository.findByRole(role).stream()
                .map(com.stockflow.inventory.users.entity.RolePermission::getPermission)
                .collect(java.util.stream.Collectors.toList());
    }

    public String generateToken(String email, String publicId, String role) {
        return generateToken(email, publicId, role, false);
    }

    public String generateToken(String email, String publicId, String role, boolean mustChangePassword) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        java.util.List<String> permissions = getPermissionsForRole(role);

        return Jwts.builder()
                .subject(email)
                .claim("public_id", publicId)
                .claim("role", role)
                .claim("permissions", permissions)
                .claim("must_change_password", mustChangePassword)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractPublicId(String token) {
        return extractClaim(token, claims -> claims.get("public_id", String.class));
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token, String email) {
        try {
            final String extractedEmail = extractEmail(token);
            return (extractedEmail.equals(email) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public long extractExpirationTimeMs(String token) {
        try {
            return extractExpiration(token).getTime();
        } catch (Exception e) {
            return System.currentTimeMillis() + expirationMs;
        }
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
