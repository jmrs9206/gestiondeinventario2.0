package com.vdenergy.inventory.materials.qr.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.auth.service.JwtService;
import com.vdenergy.inventory.common.entity.MaterialStatus;
import com.vdenergy.inventory.inventory.entity.MaterialHistory;
import com.vdenergy.inventory.inventory.repository.MaterialHistoryRepository;
import com.vdenergy.inventory.materials.entity.Material;
import com.vdenergy.inventory.materials.repository.MaterialRepository;
import com.vdenergy.inventory.offices.entity.Office;
import com.vdenergy.inventory.offices.repository.OfficeRepository;
import com.vdenergy.inventory.users.entity.Role;
import com.vdenergy.inventory.users.entity.User;
import com.vdenergy.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
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

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QrControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OfficeRepository officeRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private MaterialHistoryRepository materialHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @SpyBean
    private AuditService auditService;

    private User adminUser;
    private User tecnicoUser;
    private String adminToken;
    private String tecnicoToken;
    private Office testOffice;
    private Material testMaterial;

    @BeforeEach
    void setUp() {
        materialHistoryRepository.deleteAll();
        materialRepository.deleteAll();
        officeRepository.deleteAll();
        userRepository.deleteAll();

        // Admin User
        adminUser = new User(
                UUID.randomUUID().toString(),
                "Admin",
                "User",
                "admin@vdenergy.es",
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
                "tecnico@vdenergy.es",
                passwordEncoder.encode("TecnicoPassword123"),
                Role.TECNICO
        );
        tecnicoUser.setActive(true);
        tecnicoUser = userRepository.save(tecnicoUser);

        // Generate Tokens
        adminToken = jwtService.generateToken(adminUser.getEmail(), adminUser.getPublicId(), Role.ADMIN.name());
        tecnicoToken = jwtService.generateToken(tecnicoUser.getEmail(), tecnicoUser.getPublicId(), Role.TECNICO.name());

        // Test Office
        testOffice = new Office(UUID.randomUUID().toString(), "Madrid Office");
        testOffice.setActive(true);
        testOffice = officeRepository.save(testOffice);

        // Test Material
        testMaterial = new Material(
                "mat_12345678901234567890",
                "Router",
                "MikroTik",
                "RB4011",
                "SN-ROUTER123",
                testOffice,
                MaterialStatus.OPERATIVO
        );
        testMaterial.setActive(true);
        testMaterial = materialRepository.save(testMaterial);

        reset(auditService);
    }

    @AfterEach
    void tearDown() {
        materialHistoryRepository.deleteAll();
        materialRepository.deleteAll();
        officeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getQrCodeUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/materials/" + testMaterial.getPublicCode() + "/qr"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getQrCodeAsPngSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/materials/" + testMaterial.getPublicCode() + "/qr?format=png")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(result -> {
                    byte[] content = result.getResponse().getContentAsByteArray();
                    assertTrue(content.length > 0);
                });
    }

    @Test
    void getQrCodeAsSvgSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/materials/" + testMaterial.getPublicCode() + "/qr?format=svg")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/svg+xml"))
                .andExpect(result -> {
                    String content = result.getResponse().getContentAsString();
                    assertTrue(content.contains("<svg"));
                    assertTrue(content.contains("<path"));
                });
    }

    @Test
    void getQrCodeNonExistentReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/materials/mat_nonexistentcode/qr")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void regenerateQrAsTecnicoReturns403() throws Exception {
        mockMvc.perform(post("/api/v1/materials/" + testMaterial.getPublicCode() + "/qr/regenerate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void regenerateQrAsAdminSuccessfully() throws Exception {
        String oldPublicCode = testMaterial.getPublicCode();

        mockMvc.perform(post("/api/v1/materials/" + oldPublicCode + "/qr/regenerate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    // verify that public code changed
                    String content = result.getResponse().getContentAsString();
                    assertTrue(content.contains("\"publicCode\":"));
                    assertFalse(content.contains(oldPublicCode));
                });

        // Retrieve modified material
        List<Material> list = materialRepository.findAll();
        assertEquals(1, list.size());
        Material updatedMaterial = list.get(0);
        assertNotEquals(oldPublicCode, updatedMaterial.getPublicCode());
        assertEquals(2, updatedMaterial.getQrVersion());

        // Verify history record
        List<MaterialHistory> histories = materialHistoryRepository.findAll();
        assertEquals(1, histories.size());
        MaterialHistory history = histories.get(0);
        assertEquals("QR_REGENERATED", history.getAction());
        assertEquals(updatedMaterial.getId(), history.getMaterial().getId());
        assertTrue(history.getComment().contains(oldPublicCode));
        assertEquals(adminUser.getId(), history.getPerformedByUser().getId());

        // Verify audit log
        verify(auditService, times(1)).logEvent(
                eq("Material"),
                eq(updatedMaterial.getPublicCode()),
                eq("QR_REGENERATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any()
        );
    }

    @Test
    void getPrintLabelSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/materials/" + testMaterial.getPublicCode() + "/qr/print")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_HTML))
                .andExpect(result -> {
                    String html = result.getResponse().getContentAsString();
                    assertTrue(html.contains("<svg"));
                    assertTrue(html.contains("window.print()"));
                    assertTrue(html.contains("MikroTik"));
                    assertTrue(html.contains("RB4011"));
                    assertTrue(html.contains("SN-ROUTER123"));
                });
    }
}
