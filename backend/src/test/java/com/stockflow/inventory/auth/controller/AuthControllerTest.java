package com.stockflow.inventory.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.auth.dto.LoginRequest;
import com.stockflow.inventory.auth.dto.LogoutRequest;
import com.stockflow.inventory.auth.dto.RefreshRequest;
import com.stockflow.inventory.auth.entity.RefreshToken;
import com.stockflow.inventory.auth.repository.RefreshTokenRepository;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.boot.test.mock.mockito.SpyBean;
import com.stockflow.inventory.audit.service.AuditService;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

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

    @SpyBean
    private AuditService auditService;

    private User testUser;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        // Seed a test user
        testUser = new User(
                UUID.randomUUID().toString(),
                "John",
                "Doe",
                "john.doe@tuempresa.com",
                passwordEncoder.encode("SecurePassword123"),
                Role.TECNICO
        );
        testUser.setActive(true);
        testUser = userRepository.save(testUser);
    }

    @Test
    void loginWithCorrectCredentialsReturnsTokens() throws Exception {
        LoginRequest loginRequest = new LoginRequest("john.doe@tuempresa.com", "SecurePassword123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isEmpty()) // Nulled out for security
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(cookie().httpOnly("refreshToken", true))
                .andExpect(cookie().secure("refreshToken", true))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900));
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        LoginRequest loginRequest = new LoginRequest("john.doe@tuempresa.com", "WrongPassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void loginWithInactiveUserReturns401() throws Exception {
        testUser.setActive(false);
        userRepository.save(testUser);

        LoginRequest loginRequest = new LoginRequest("john.doe@tuempresa.com", "SecurePassword123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User account is inactive"));
    }

    @Test
    void refreshTokenRotationFlowWorks() throws Exception {
        // 1. Login to get tokens
        LoginRequest loginRequest = new LoginRequest("john.doe@tuempresa.com", "SecurePassword123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("refreshToken"))
                .andReturn();

        jakarta.servlet.http.Cookie originalCookie = loginResult.getResponse().getCookie("refreshToken");
        assertNotNull(originalCookie);
        String originalRefreshToken = originalCookie.getValue();

        // 2. Perform refresh using the cookie
        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(originalCookie)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isEmpty()) // Nulled out
                .andExpect(cookie().exists("refreshToken"))
                .andReturn();

        jakarta.servlet.http.Cookie newCookie = refreshResult.getResponse().getCookie("refreshToken");
        assertNotNull(newCookie);
        String newRefreshToken = newCookie.getValue();

        // Verify rotation (original token should be revoked, new token should exist)
        assertNotEquals(originalRefreshToken, newRefreshToken);

        // Try to refresh again with the original token (should fail)
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(originalCookie)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshWithInvalidTokenReturns401() throws Exception {
        jakarta.servlet.http.Cookie invalidCookie = new jakarta.servlet.http.Cookie("refreshToken", "invalid-uuid-token");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(invalidCookie)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid refresh token"));
    }

    @Test
    void logoutRevokesToken() throws Exception {
        // 1. Login to get token
        LoginRequest loginRequest = new LoginRequest("john.doe@tuempresa.com", "SecurePassword123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("refreshToken"))
                .andReturn();

        jakarta.servlet.http.Cookie originalCookie = loginResult.getResponse().getCookie("refreshToken");
        assertNotNull(originalCookie);

        // 2. Logout
        mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(originalCookie)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("refreshToken", 0)); // Cleared

        // 3. Try to refresh using the revoked token (should fail)
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(originalCookie)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accessProtectedResourceWithValidJwtWorks() throws Exception {
        // 1. Login to get jwt access token
        LoginRequest loginRequest = new LoginRequest("john.doe@tuempresa.com", "SecurePassword123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(responseBody).get("accessToken").asText();

        // 2. Try to access a non-existent route, but authenticated
        // Since we are authenticated, it should return 404 (Not Found) instead of 401 (Unauthorized)
        mockMvc.perform(get("/api/v1/some-secure-url-that-doesnt-exist")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticatedUserAccessingSecuredEndpointsReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/admin-only"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        mockMvc.perform(get("/api/v1/auth/tecnico-only"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        mockMvc.perform(get("/api/v1/auth/authenticated"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void tecnicoUserHasAccessToTecnicoAndAuthenticatedButForbiddenFromAdmin() throws Exception {
        // John Doe is TECNICO
        LoginRequest loginRequest = new LoginRequest("john.doe@tuempresa.com", "SecurePassword123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        // 1. Check access to /tecnico-only (allowed)
        mockMvc.perform(get("/api/v1/auth/tecnico-only")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Welcome Tecnico"));

        // 2. Check access to /authenticated (allowed)
        mockMvc.perform(get("/api/v1/auth/authenticated")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Welcome Authenticated"));

        // 3. Check access to /admin-only (forbidden)
        mockMvc.perform(get("/api/v1/auth/admin-only")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));

        // Verify ACCESS_DENIED audit log event was logged
        verify(auditService, atLeastOnce()).logEvent(
                eq("User"),
                eq(testUser.getPublicId()),
                eq("ACCESS_DENIED"),
                eq("USER"),
                eq(testUser.getPublicId()),
                any(),
                any()
        );
    }

    @Test
    void adminUserHasAccessToAdminAndAuthenticatedButForbiddenFromTecnico() throws Exception {
        // Create an ADMIN user
        User adminUser = new User(
                UUID.randomUUID().toString(),
                "Admin",
                "User",
                "admin.user@tuempresa.com",
                passwordEncoder.encode("AdminPassword123"),
                Role.ADMIN
        );
        adminUser.setActive(true);
        adminUser = userRepository.save(adminUser);

        LoginRequest loginRequest = new LoginRequest("admin.user@tuempresa.com", "AdminPassword123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        // 1. Check access to /admin-only (allowed)
        mockMvc.perform(get("/api/v1/auth/admin-only")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Welcome Admin"));

        // 2. Check access to /authenticated (allowed)
        mockMvc.perform(get("/api/v1/auth/authenticated")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Welcome Authenticated"));

        // 3. Check access to /tecnico-only (forbidden)
        mockMvc.perform(get("/api/v1/auth/tecnico-only")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));

        // Verify ACCESS_DENIED audit log event was logged
        verify(auditService, atLeastOnce()).logEvent(
                eq("User"),
                eq(adminUser.getPublicId()),
                eq("ACCESS_DENIED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any()
        );
    }
}
