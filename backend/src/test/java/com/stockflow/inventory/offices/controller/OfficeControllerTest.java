package com.stockflow.inventory.offices.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.auth.service.JwtService;
import com.stockflow.inventory.offices.dto.OfficeRequest;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OfficeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OfficeRepository officeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @SpyBean
    private AuditService auditService;

    private User adminUser;
    private User tecnicoUser;
    private String adminToken;
    private String tecnicoToken;
    private Office testOffice;

    @BeforeEach
    void setUp() {
        officeRepository.deleteAll();
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

        // Initial test office
        testOffice = new Office(UUID.randomUUID().toString(), "Madrid Office");
        testOffice.setActive(true);
        testOffice = officeRepository.save(testOffice);

        reset(auditService);
    }

    @Test
    void listOfficesUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/offices"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listOfficesAsTecnicoReturns200() throws Exception {
        mockMvc.perform(get("/api/v1/offices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    void createOfficeSuccessfullyByAdmin() throws Exception {
        OfficeRequest request = new OfficeRequest();
        request.setName("Barcelona Office");

        mockMvc.perform(post("/api/v1/offices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.publicId").isNotEmpty())
                .andExpect(jsonPath("$.data.name").value("BARCELONA OFFICE"))
                .andExpect(jsonPath("$.data.active").value(true));

        verify(auditService, times(1)).logEvent(
                eq("Office"),
                anyString(),
                eq("OFFICE_CREATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void createOfficeSuccessfullyByTecnico() throws Exception {
        OfficeRequest request = new OfficeRequest();
        request.setName("Valencia Office");

        mockMvc.perform(post("/api/v1/offices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("VALENCIA OFFICE"));

        verify(auditService, times(1)).logEvent(
                eq("Office"),
                anyString(),
                eq("OFFICE_CREATED"),
                eq("USER"),
                eq(tecnicoUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void createOfficeWithDuplicateNameReturns409() throws Exception {
        OfficeRequest request = new OfficeRequest();
        request.setName("Madrid Office"); // duplicate

        mockMvc.perform(post("/api/v1/offices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_CONFLICT"));
    }

    @Test
    void createOfficeWithInvalidDataReturns400() throws Exception {
        OfficeRequest request = new OfficeRequest();
        request.setName(""); // blank

        mockMvc.perform(post("/api/v1/offices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_FAILED"));
    }

    @Test
    void getOfficeDetailsSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/offices/" + testOffice.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.publicId").value(testOffice.getPublicId()))
                .andExpect(jsonPath("$.data.name").value("Madrid Office"));
    }

    @Test
    void getOfficeDetailsNonExistentReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/offices/non-existent-uuid")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void updateOfficeSuccessfully() throws Exception {
        OfficeRequest request = new OfficeRequest();
        request.setName("Madrid Office Updated");

        mockMvc.perform(put("/api/v1/offices/" + testOffice.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("MADRID OFFICE UPDATED"));

        verify(auditService, times(1)).logEvent(
                eq("Office"),
                eq(testOffice.getPublicId()),
                eq("OFFICE_UPDATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void softDeleteOfficeSuccessfully() throws Exception {
        mockMvc.perform(delete("/api/v1/offices/" + testOffice.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        // Verify it is no longer listed in active offices
        mockMvc.perform(get("/api/v1/offices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));

        // Verify subsequent read returns 404
        mockMvc.perform(get("/api/v1/offices/" + testOffice.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isNotFound());

        verify(auditService, times(1)).logEvent(
                eq("Office"),
                eq(testOffice.getPublicId()),
                eq("OFFICE_DISABLED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void reactivateOfficeSuccessfully() throws Exception {
        // First delete it
        mockMvc.perform(delete("/api/v1/offices/" + testOffice.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk());

        reset(auditService);

        // Reactivate it
        mockMvc.perform(post("/api/v1/offices/" + testOffice.getPublicId() + "/reactivate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(true));

        // Verify it is listed in active offices again
        mockMvc.perform(get("/api/v1/offices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1));

        verify(auditService, times(1)).logEvent(
                eq("Office"),
                eq(testOffice.getPublicId()),
                eq("OFFICE_REACTIVATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void listOfficesWithIncludeInactiveReturnsAll() throws Exception {
        // Delete it
        mockMvc.perform(delete("/api/v1/offices/" + testOffice.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk());

        // List with default includeInactive (false)
        mockMvc.perform(get("/api/v1/offices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));

        // List with includeInactive = true
        mockMvc.perform(get("/api/v1/offices")
                        .param("includeInactive", "true")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].active").value(false));
    }
}
