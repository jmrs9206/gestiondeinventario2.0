package com.stockflow.inventory.users.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.auth.entity.RefreshToken;
import com.stockflow.inventory.auth.repository.RefreshTokenRepository;
import com.stockflow.inventory.auth.service.JwtService;
import com.stockflow.inventory.mail.service.EmailService;
import com.stockflow.inventory.users.dto.*;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @SpyBean
    private AuditService auditService;

    @MockBean
    private EmailService emailService;

    private User adminUser;
    private User tecnicoUser;
    private String adminToken;
    private String tecnicoToken;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        // Admin User
        adminUser = new User(
                UUID.randomUUID().toString(),
                "Admin",
                "User",
                "admin@tuempresa.com",
                passwordEncoder.encode("AdminPassword123"),
                Role.ADMIN
        );
        adminUser.setActive(true);
        adminUser = userRepository.save(adminUser);

        // Tecnico User
        tecnicoUser = new User(
                UUID.randomUUID().toString(),
                "Tecnico",
                "User",
                "tecnico@tuempresa.com",
                passwordEncoder.encode("TecnicoPassword123"),
                Role.TECNICO
        );
        tecnicoUser.setActive(true);
        tecnicoUser = userRepository.save(tecnicoUser);

        // Generate Tokens
        adminToken = jwtService.generateToken(adminUser.getEmail(), adminUser.getPublicId(), Role.ADMIN.name());
        tecnicoToken = jwtService.generateToken(tecnicoUser.getEmail(), tecnicoUser.getPublicId(), Role.TECNICO.name());

        reset(auditService);
    }

    @Test
    void listUsersUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listUsersAsTecnicoReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void listUsersAsAdminReturns200() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    void createUserSuccessfullyByAdmin() throws Exception {
        UserCreateRequest request = new UserCreateRequest();
        request.setFirstName("New");
        request.setLastName("User");
        request.setEmail("new.user@tuempresa.com");
        request.setPassword("NewPassword123");
        request.setRole(Role.TECNICO);

        mockMvc.perform(post("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.publicId").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("new.user@tuempresa.com"))
                .andExpect(jsonPath("$.data.role").value("TECNICO"))
                .andExpect(jsonPath("$.data.active").value(true));

        verify(auditService, times(1)).logEvent(
                eq("User"),
                anyString(),
                eq("USER_CREATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void createUserWithDuplicateEmailReturns409() throws Exception {
        UserCreateRequest request = new UserCreateRequest();
        request.setFirstName("Duplicate");
        request.setLastName("User");
        request.setEmail("tecnico@tuempresa.com"); // existing email
        request.setPassword("NewPassword123");
        request.setRole(Role.TECNICO);

        mockMvc.perform(post("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_CONFLICT"))
                .andExpect(jsonPath("$.error.message").value("Email already in use: tecnico@tuempresa.com"));
    }

    @Test
    void createUserWithInvalidDataReturns400() throws Exception {
        UserCreateRequest request = new UserCreateRequest();
        request.setFirstName(""); // invalid
        request.setLastName("User");
        request.setEmail("invalid-email"); // invalid
        request.setPassword("short"); // invalid (too short)
        request.setRole(null); // invalid

        mockMvc.perform(post("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_FAILED"));
    }

    @Test
    void getUserDetailsSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/users/" + tecnicoUser.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.publicId").value(tecnicoUser.getPublicId()))
                .andExpect(jsonPath("$.data.email").value("tecnico@tuempresa.com"));
    }

    @Test
    void getUserDetailsNonExistentReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/users/non-existent-uuid")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void updateUserSuccessfully() throws Exception {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setFirstName("UpdatedFirstName");
        request.setLastName("UpdatedLastName");
        request.setEmail("tecnico.updated@tuempresa.com");
        request.setRole(Role.ADMIN);

        mockMvc.perform(put("/api/v1/users/" + tecnicoUser.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName").value("UPDATEDFIRSTNAME"))
                .andExpect(jsonPath("$.data.email").value("tecnico.updated@tuempresa.com"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));

        verify(auditService, times(1)).logEvent(
                eq("User"),
                eq(tecnicoUser.getPublicId()),
                eq("USER_UPDATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void anotherAdminCannotModifyOwnerAccount() throws Exception {
        User otherAdmin = new User(
                UUID.randomUUID().toString(),
                "Other",
                "Admin",
                "other.admin@tuempresa.com",
                passwordEncoder.encode("OtherAdminPassword123"),
                Role.ADMIN
        );
        otherAdmin.setActive(true);
        otherAdmin = userRepository.save(otherAdmin);
        String otherAdminToken = jwtService.generateToken(otherAdmin.getEmail(), otherAdmin.getPublicId(), Role.ADMIN.name());

        UserUpdateRequest request = new UserUpdateRequest();
        request.setFirstName("Compromised");
        request.setLastName("Owner");
        request.setEmail("attacker@tuempresa.com");
        request.setRole(Role.TECNICO);

        mockMvc.perform(put("/api/v1/users/" + adminUser.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + otherAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_CONFLICT"));

        User owner = userRepository.findByPublicId(adminUser.getPublicId()).orElseThrow();
        assertEquals("admin@tuempresa.com", owner.getEmail());
        assertEquals(Role.ADMIN, owner.getRole());
        assertTrue(owner.isActive());
    }

    @Test
    void ownerCannotBeDeactivated() throws Exception {
        UserStatusRequest request = new UserStatusRequest();
        request.setActive(false);

        mockMvc.perform(patch("/api/v1/users/" + adminUser.getPublicId() + "/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_CONFLICT"));

        User owner = userRepository.findByPublicId(adminUser.getPublicId()).orElseThrow();
        assertTrue(owner.isActive());
    }

    @Test
    void anotherAdminCannotChangeOwnerPassword() throws Exception {
        User otherAdmin = new User(
                UUID.randomUUID().toString(),
                "Other",
                "Admin",
                "other.admin@tuempresa.com",
                passwordEncoder.encode("OtherAdminPassword123"),
                Role.ADMIN
        );
        otherAdmin.setActive(true);
        otherAdmin = userRepository.save(otherAdmin);
        String otherAdminToken = jwtService.generateToken(otherAdmin.getEmail(), otherAdmin.getPublicId(), Role.ADMIN.name());

        UserPasswordRequest request = new UserPasswordRequest();
        request.setPassword("CompromisedPassword123");

        mockMvc.perform(put("/api/v1/users/" + adminUser.getPublicId() + "/password")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + otherAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_CONFLICT"));

        User owner = userRepository.findByPublicId(adminUser.getPublicId()).orElseThrow();
        assertFalse(passwordEncoder.matches("CompromisedPassword123", owner.getPasswordHash()));
    }

    @Test
    void ownerCanChangeOwnPassword() throws Exception {
        UserPasswordRequest request = new UserPasswordRequest();
        request.setPassword("OwnerNewSecurePassword123");

        mockMvc.perform(put("/api/v1/users/" + adminUser.getPublicId() + "/password")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        User owner = userRepository.findByPublicId(adminUser.getPublicId()).orElseThrow();
        assertTrue(passwordEncoder.matches("OwnerNewSecurePassword123", owner.getPasswordHash()));
    }

    @Test
    void changeUserStatusToDisabledRevokesTokens() throws Exception {
        // Create an active refresh token for tecnico user
        RefreshToken token = new RefreshToken(tecnicoUser, "tokenhash123", LocalDateTime.now().plusDays(1));
        refreshTokenRepository.save(token);

        UserStatusRequest request = new UserStatusRequest();
        request.setActive(false);

        mockMvc.perform(patch("/api/v1/users/" + tecnicoUser.getPublicId() + "/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        // Verify refresh token is revoked
        List<RefreshToken> tokens = refreshTokenRepository.findByUserAndRevokedFalse(tecnicoUser);
        assertTrue(tokens.isEmpty());

        verify(auditService, times(1)).logEvent(
                eq("User"),
                eq(tecnicoUser.getPublicId()),
                eq("USER_DISABLED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void changePasswordSuccessfully() throws Exception {
        UserPasswordRequest request = new UserPasswordRequest();
        request.setPassword("NewSecurePassword123");

        mockMvc.perform(put("/api/v1/users/" + tecnicoUser.getPublicId() + "/password")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Verify password in DB actually updated (and encrypted)
        User dbUser = userRepository.findByPublicId(tecnicoUser.getPublicId()).orElseThrow();
        assertTrue(passwordEncoder.matches("NewSecurePassword123", dbUser.getPasswordHash()));

        verify(auditService, times(1)).logEvent(
                eq("User"),
                eq(tecnicoUser.getPublicId()),
                eq("PASSWORD_CHANGED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }
}
