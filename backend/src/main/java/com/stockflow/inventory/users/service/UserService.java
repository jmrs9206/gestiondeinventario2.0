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
import org.springframework.beans.factory.annotation.Value;
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
    private final String ownerEmail;

    public UserService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService,
            EmailService emailService,
            ObjectMapper objectMapper,
            @Value("${app.owner.email:${ADMIN_EMAIL:admin@tuempresa.com}}") String ownerEmail
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
        this.ownerEmail = normalizeEmail(ownerEmail);
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

    private String normalizeText(String input) {
        return com.stockflow.inventory.common.utils.TextNormalizer.normalize(input);
    }

    private String normalizeEmail(String input) {
        if (input == null) {
            return "";
        }
        return com.stockflow.inventory.common.utils.TextNormalizer.normalize(input).toLowerCase();
    }

    private boolean isOwnerAccount(User user) {
        return user != null && user.getEmail() != null && user.getEmail().equalsIgnoreCase(ownerEmail);
    }

    private boolean isOwnerPerformer(User user, String performerPublicId) {
        return isOwnerAccount(user) && user.getPublicId().equals(performerPublicId);
    }

    private void assertOwnerProfileMutationAllowed(User user, UserUpdateRequest request, String performerPublicId) {
        if (!isOwnerAccount(user)) {
            return;
        }

        if (!isOwnerPerformer(user, performerPublicId)) {
            throw new ConflictException("La cuenta propietaria del sistema no puede ser modificada por otro usuario.");
        }

        String requestedEmail = normalizeEmail(request.getEmail());
        if (!user.getEmail().equalsIgnoreCase(requestedEmail)) {
            throw new ConflictException("El email de la cuenta propietaria del sistema no puede cambiarse desde el panel.");
        }

        if (request.getRole() != com.stockflow.inventory.users.entity.Role.ADMIN) {
            throw new ConflictException("La cuenta propietaria del sistema no puede perder el rol ADMIN.");
        }
    }

    private void assertOwnerStatusMutationAllowed(User user, UserStatusRequest request) {
        if (isOwnerAccount(user) && Boolean.FALSE.equals(request.getActive())) {
            throw new ConflictException("La cuenta propietaria del sistema no puede desactivarse.");
        }
    }

    private void assertOwnerPasswordMutationAllowed(User user, String performerPublicId) {
        if (isOwnerAccount(user) && !isOwnerPerformer(user, performerPublicId)) {
            throw new ConflictException("La contraseña de la cuenta propietaria del sistema solo puede cambiarla el propio propietario.");
        }
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request, String performerPublicId, String ip, String userAgent) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ConflictException("Email already in use: " + normalizedEmail);
        }

        String publicId = UUID.randomUUID().toString();
        String passwordHash = passwordEncoder.encode(UUID.randomUUID().toString());

        User user = new User(
                publicId,
                normalizeText(request.getFirstName()),
                normalizeText(request.getLastName()),
                normalizedEmail,
                passwordHash,
                request.getRole()
        );
        user.setActive(true);
        user.setMustChangePassword(true);
        user.setInvitationToken(UUID.randomUUID().toString());
        user.setInvitationTokenExpiry(java.time.LocalDateTime.now().plusDays(7));

        User savedUser = userRepository.save(user);

        try {
            emailService.sendInvitationEmail(savedUser.getEmail(), savedUser.getFirstName(), savedUser.getLastName(), savedUser.getInvitationToken());
        } catch (Exception e) {
            System.err.println("WARN: Failed to send invitation email to " + savedUser.getEmail() + ": " + e.getMessage());
        }

        String newValueJson = toJson(new UserResponse(savedUser));
        auditService.logEvent("User", savedUser.getPublicId(), "USER_CREATED", "USER", performerPublicId, ip, userAgent, null, newValueJson);

        return new UserResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(String publicId, UserUpdateRequest request, String performerPublicId, String ip, String userAgent) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));

        assertOwnerProfileMutationAllowed(user, request, performerPublicId);

        String normalizedEmail = normalizeEmail(request.getEmail());
        if (!user.getEmail().equalsIgnoreCase(normalizedEmail)) {
            if (userRepository.findByEmail(normalizedEmail).isPresent()) {
                throw new ConflictException("Email already in use: " + normalizedEmail);
            }
            user.setEmail(normalizedEmail);
        }

        String oldValueJson = toJson(new UserResponse(user));

        user.setFirstName(normalizeText(request.getFirstName()));
        user.setLastName(normalizeText(request.getLastName()));
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

        assertOwnerStatusMutationAllowed(user, request);

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

        assertOwnerPasswordMutationAllowed(user, performerPublicId);

        String oldValueJson = "{\"password\": \"[PROTECTED]\"}";

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setMustChangePassword(false);
        User updatedUser = userRepository.save(user);

        String newValueJson = "{\"password\": \"[PROTECTED]\"}";
        auditService.logEvent("User", updatedUser.getPublicId(), "PASSWORD_CHANGED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new UserResponse(updatedUser);
    }

    @Transactional
    public UserResponse sendPasswordResetEmail(String publicId, String performerPublicId, String ip, String userAgent) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));

        if (user.getEmail().equalsIgnoreCase("admin@juliodriguez.dev") || user.getEmail().equalsIgnoreCase("admin@tuempresa.com")) {
            throw new ConflictException("No se permite restablecer la contraseña del administrador principal del sistema.");
        }

        String oldValueJson = toJson(new UserResponse(user));

        user.setInvitationToken(UUID.randomUUID().toString());
        user.setInvitationTokenExpiry(java.time.LocalDateTime.now().plusHours(24));
        user.setMustChangePassword(true);
        User updatedUser = userRepository.save(user);

        emailService.sendInvitationEmail(updatedUser.getEmail(), updatedUser.getFirstName(), updatedUser.getLastName(), updatedUser.getInvitationToken());

        String newValueJson = toJson(new UserResponse(updatedUser));
        auditService.logEvent("User", updatedUser.getPublicId(), "PASSWORD_RESET_REQUESTED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

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
