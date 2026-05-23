package com.vdenergy.inventory.auth.service;

import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.auth.dto.LoginResponse;
import com.vdenergy.inventory.auth.entity.RefreshToken;
import com.vdenergy.inventory.auth.repository.RefreshTokenRepository;
import com.vdenergy.inventory.users.entity.User;
import com.vdenergy.inventory.users.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional
    public LoginResponse login(String email, String password, String ip, String userAgent) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    auditService.logEvent("User", email, "LOGIN_FAILED", "SYSTEM", "NONE", ip, userAgent);
                    return new BadCredentialsException("Invalid credentials");
                });

        if (!user.isActive()) {
            auditService.logEvent("User", user.getPublicId(), "LOGIN_FAILED", "USER", user.getPublicId(), ip, userAgent);
            throw new BadCredentialsException("User account is inactive");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            auditService.logEvent("User", user.getPublicId(), "LOGIN_FAILED", "USER", user.getPublicId(), ip, userAgent);
            throw new BadCredentialsException("Invalid credentials");
        }

        auditService.logEvent("User", user.getPublicId(), "LOGIN_SUCCESS", "USER", user.getPublicId(), ip, userAgent);

        // Generate Access Token
        String accessToken = jwtService.generateToken(user.getEmail(), user.getPublicId(), user.getRole().name());

        // Generate Refresh Token
        String refreshTokenStr = UUID.randomUUID().toString();
        String tokenHash = hashToken(refreshTokenStr);
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7); // Default 7 days

        RefreshToken refreshToken = new RefreshToken(user, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);

        long expiresInSeconds = jwtService.getExpirationMs() / 1000;
        return new LoginResponse(accessToken, refreshTokenStr, expiresInSeconds);
    }

    @Transactional
    public LoginResponse refresh(String refreshTokenStr, String ip, String userAgent) {
        String tokenHash = hashToken(refreshTokenStr);
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("Expired or revoked refresh token");
        }

        User user = refreshToken.getUser();
        if (!user.isActive()) {
            throw new BadCredentialsException("User account is inactive");
        }

        auditService.logEvent("User", user.getPublicId(), "TOKEN_REFRESH", "USER", user.getPublicId(), ip, userAgent);

        // Generate new Access Token
        String accessToken = jwtService.generateToken(user.getEmail(), user.getPublicId(), user.getRole().name());

        // Rotate Refresh Token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        String newRefreshTokenStr = UUID.randomUUID().toString();
        String newHash = hashToken(newRefreshTokenStr);
        LocalDateTime newExpiresAt = LocalDateTime.now().plusDays(7);

        RefreshToken newRefreshToken = new RefreshToken(user, newHash, newExpiresAt);
        refreshTokenRepository.save(newRefreshToken);

        long expiresInSeconds = jwtService.getExpirationMs() / 1000;
        return new LoginResponse(accessToken, newRefreshTokenStr, expiresInSeconds);
    }

    @Transactional
    public void logout(String refreshTokenStr, String ip, String userAgent) {
        String tokenHash = hashToken(refreshTokenStr);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(refreshToken -> {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            User user = refreshToken.getUser();
            auditService.logEvent("User", user.getPublicId(), "LOGOUT", "USER", user.getPublicId(), ip, userAgent);
        });
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
