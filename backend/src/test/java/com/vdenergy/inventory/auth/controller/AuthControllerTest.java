package com.vdenergy.inventory.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vdenergy.inventory.auth.dto.LoginRequest;
import com.vdenergy.inventory.auth.dto.LogoutRequest;
import com.vdenergy.inventory.auth.dto.RefreshRequest;
import com.vdenergy.inventory.auth.entity.RefreshToken;
import com.vdenergy.inventory.auth.repository.RefreshTokenRepository;
import com.vdenergy.inventory.common.entity.UserRole;
import com.vdenergy.inventory.users.entity.User;
import com.vdenergy.inventory.users.repository.UserRepository;
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
                "john.doe@vdenergy.es",
                passwordEncoder.encode("SecurePassword123"),
                UserRole.TECNICO
        );
        testUser.setActive(true);
        testUser = userRepository.save(testUser);
    }

    @Test
    void loginWithCorrectCredentialsReturnsTokens() throws Exception {
        LoginRequest loginRequest = new LoginRequest("john.doe@vdenergy.es", "SecurePassword123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900));
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        LoginRequest loginRequest = new LoginRequest("john.doe@vdenergy.es", "WrongPassword");

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

        LoginRequest loginRequest = new LoginRequest("john.doe@vdenergy.es", "SecurePassword123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User account is inactive"));
    }

    @Test
    void refreshTokenRotationFlowWorks() throws Exception {
        // 1. Login to get tokens
        LoginRequest loginRequest = new LoginRequest("john.doe@vdenergy.es", "SecurePassword123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String originalRefreshToken = objectMapper.readTree(responseBody).get("refreshToken").asText();

        // 2. Perform refresh
        RefreshRequest refreshRequest = new RefreshRequest(originalRefreshToken);
        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andReturn();

        String refreshResponseBody = refreshResult.getResponse().getContentAsString();
        String newRefreshToken = objectMapper.readTree(refreshResponseBody).get("refreshToken").asText();

        // Verify rotation (original token should be revoked, new token should exist)
        assertNotEquals(originalRefreshToken, newRefreshToken);

        // Try to refresh again with the original token (should fail)
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshWithInvalidTokenReturns401() throws Exception {
        RefreshRequest refreshRequest = new RefreshRequest("invalid-uuid-token");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid refresh token"));
    }

    @Test
    void logoutRevokesToken() throws Exception {
        // 1. Login to get token
        LoginRequest loginRequest = new LoginRequest("john.doe@vdenergy.es", "SecurePassword123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String refreshToken = objectMapper.readTree(responseBody).get("refreshToken").asText();

        // 2. Logout
        LogoutRequest logoutRequest = new LogoutRequest(refreshToken);
        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk());

        // 3. Try to refresh using the revoked token (should fail)
        RefreshRequest refreshRequest = new RefreshRequest(refreshToken);
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accessProtectedResourceWithValidJwtWorks() throws Exception {
        // 1. Login to get jwt access token
        LoginRequest loginRequest = new LoginRequest("john.doe@vdenergy.es", "SecurePassword123");
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
}
