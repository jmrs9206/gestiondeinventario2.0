package com.stockflow.inventory.users.service;

import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.auth.entity.RefreshToken;
import com.stockflow.inventory.auth.repository.RefreshTokenRepository;
import com.stockflow.inventory.common.exceptions.ConflictException;
import com.stockflow.inventory.common.exceptions.ResourceNotFoundException;
import com.stockflow.inventory.users.dto.*;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import com.stockflow.inventory.mail.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    public UserService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService,
            EmailService emailService,
            ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String generateSecurePassword() {
        return UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12);
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request, String performerPublicId, String ip, String userAgent) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }

        String publicId = UUID.randomUUID().toString();
        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = generateSecurePassword();
        }
        String passwordHash = passwordEncoder.encode(rawPassword);

        User user = new User(
                publicId,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                passwordHash,
                request.getRole()
        );
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // Send email with credentials
        try {
            emailService.sendCredentialsEmail(savedUser.getEmail(), savedUser.getFirstName(), savedUser.getLastName(), rawPassword);
        } catch (Exception e) {
            System.err.println("WARN: Failed to send credentials email to " + savedUser.getEmail() + ": " + e.getMessage());
        }

        String newValueJson = toJson(new UserResponse(savedUser));
        auditService.logEvent("User", savedUser.getPublicId(), "USER_CREATED", "USER", performerPublicId, ip, userAgent, null, newValueJson);

        return new UserResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(String publicId, UserUpdateRequest request, String performerPublicId, String ip, String userAgent) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));

        if (user.getEmail().equalsIgnoreCase("admin@tuempresa.com")) {
            throw new ConflictException("No se permite modificar la cuenta del administrador principal del sistema.");
        }

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new ConflictException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        String oldValueJson = toJson(new UserResponse(user));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());

        User updatedUser = userRepository.save(user);

        String newValueJson = toJson(new UserResponse(updatedUser));
        auditService.logEvent("User", updatedUser.getPublicId(), "USER_UPDATED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new UserResponse(updatedUser);
    }

    @Transactional
    public UserResponse changeUserStatus(String publicId, UserStatusRequest request, String performerPublicId, String ip, String userAgent) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));

        if (user.getEmail().equalsIgnoreCase("admin@tuempresa.com")) {
            throw new ConflictException("No se permite desactivar la cuenta del administrador principal del sistema.");
        }

        if (user.isActive() != request.getActive()) {
            String oldValueJson = toJson(new UserResponse(user));

            user.setActive(request.getActive());
            User updatedUser = userRepository.save(user);

            String action = request.getActive() ? "USER_ENABLED" : "USER_DISABLED";

            if (!request.getActive()) {
                // Revoke all refresh tokens for this user
                List<RefreshToken> activeTokens = refreshTokenRepository.findByUserAndRevokedFalse(user);
                for (RefreshToken token : activeTokens) {
                    token.setRevoked(true);
                }
                refreshTokenRepository.saveAll(activeTokens);
            }

            String newValueJson = toJson(new UserResponse(updatedUser));
            auditService.logEvent("User", updatedUser.getPublicId(), action, "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);
            return new UserResponse(updatedUser);
        }

        return new UserResponse(user);
    }

    @Transactional
    public UserResponse changePassword(String publicId, UserPasswordRequest request, String performerPublicId, String ip, String userAgent) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));

        if (user.getEmail().equalsIgnoreCase("admin@tuempresa.com")) {
            throw new ConflictException("No se permite cambiar la contraseña del administrador principal del sistema desde el panel.");
        }

        String oldValueJson = "{\"password\": \"[PROTECTED]\"}";

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setMustChangePassword(false);
        User updatedUser = userRepository.save(user);

        String newValueJson = "{\"password\": \"[PROTECTED]\"}";
        auditService.logEvent("User", updatedUser.getPublicId(), "PASSWORD_CHANGED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new UserResponse(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));
        return new UserResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAll(pageable);
        return usersPage.map(UserResponse::new);
    }
}
