package com.vdenergy.inventory.users.service;

import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.auth.entity.RefreshToken;
import com.vdenergy.inventory.auth.repository.RefreshTokenRepository;
import com.vdenergy.inventory.common.exceptions.ConflictException;
import com.vdenergy.inventory.common.exceptions.ResourceNotFoundException;
import com.vdenergy.inventory.users.dto.*;
import com.vdenergy.inventory.users.entity.User;
import com.vdenergy.inventory.users.repository.UserRepository;
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

    public UserService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request, String performerPublicId, String ip, String userAgent) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }

        String publicId = UUID.randomUUID().toString();
        String passwordHash = passwordEncoder.encode(request.getPassword());

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

        auditService.logEvent("User", savedUser.getPublicId(), "USER_CREATED", "USER", performerPublicId, ip, userAgent);

        return new UserResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(String publicId, UserUpdateRequest request, String performerPublicId, String ip, String userAgent) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new ConflictException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());

        User updatedUser = userRepository.save(user);

        auditService.logEvent("User", updatedUser.getPublicId(), "USER_UPDATED", "USER", performerPublicId, ip, userAgent);

        return new UserResponse(updatedUser);
    }

    @Transactional
    public UserResponse changeUserStatus(String publicId, UserStatusRequest request, String performerPublicId, String ip, String userAgent) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));

        if (user.isActive() != request.getActive()) {
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

            auditService.logEvent("User", updatedUser.getPublicId(), action, "USER", performerPublicId, ip, userAgent);
            return new UserResponse(updatedUser);
        }

        return new UserResponse(user);
    }

    @Transactional
    public UserResponse changePassword(String publicId, UserPasswordRequest request, String performerPublicId, String ip, String userAgent) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with public ID: " + publicId));

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        User updatedUser = userRepository.save(user);

        auditService.logEvent("User", updatedUser.getPublicId(), "PASSWORD_CHANGED", "USER", performerPublicId, ip, userAgent);

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
