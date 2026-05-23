package com.vdenergy.inventory.inventory.controller;

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
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MaterialHistoryControllerTest {

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

    private User adminUser;
    private User tecnicoUser;
    private String tecnicoToken;
    private Office testOffice1;
    private Office testOffice2;
    private Material testMaterial1;
    private Material testMaterial2;

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

        // Técnico User
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

        // Generate Token
        tecnicoToken = jwtService.generateToken(tecnicoUser.getEmail(), tecnicoUser.getPublicId(), Role.TECNICO.name());

        // Test Offices
        testOffice1 = new Office(UUID.randomUUID().toString(), "Madrid Office");
        testOffice1.setActive(true);
        testOffice1 = officeRepository.save(testOffice1);

        testOffice2 = new Office(UUID.randomUUID().toString(), "Barcelona Office");
        testOffice2.setActive(true);
        testOffice2 = officeRepository.save(testOffice2);

        // Test Materials
        testMaterial1 = new Material(
                "mat_11111111111111111111",
                "Router",
                "MikroTik",
                "RB4011",
                "SN111",
                testOffice1,
                MaterialStatus.OPERATIVO
        );
        testMaterial1.setActive(true);
        testMaterial1 = materialRepository.save(testMaterial1);

        testMaterial2 = new Material(
                "mat_22222222222222222222",
                "Switch",
                "Cisco",
                "Catalyst",
                "SN222",
                testOffice2,
                MaterialStatus.OPERATIVO
        );
        testMaterial2.setActive(true);
        testMaterial2 = materialRepository.save(testMaterial2);

        // Populate history records
        // Record 1: Material 1 creation
        MaterialHistory h1 = new MaterialHistory(
                testMaterial1,
                "MATERIAL_CREATED",
                null,
                MaterialStatus.OPERATIVO,
                null,
                testOffice1,
                "Initial stock",
                adminUser
        );
        materialHistoryRepository.save(h1);

        // Record 2: Material 1 status update
        MaterialHistory h2 = new MaterialHistory(
                testMaterial1,
                "STATUS_CHANGED",
                MaterialStatus.OPERATIVO,
                MaterialStatus.ROTO,
                testOffice1,
                testOffice1,
                "Hardware failure detected",
                tecnicoUser
        );
        materialHistoryRepository.save(h2);

        // Record 3: Material 2 creation
        MaterialHistory h3 = new MaterialHistory(
                testMaterial2,
                "MATERIAL_CREATED",
                null,
                MaterialStatus.OPERATIVO,
                null,
                testOffice2,
                "Barcelona deployment",
                tecnicoUser
        );
        materialHistoryRepository.save(h3);
    }

    @AfterEach
    void tearDown() {
        materialHistoryRepository.deleteAll();
        materialRepository.deleteAll();
        officeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getHistoryUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/inventory/history"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getGeneralHistorySuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/inventory/history")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(3)));
    }

    @Test
    void getGeneralHistoryFilteredByMaterial() throws Exception {
        mockMvc.perform(get("/api/v1/inventory/history?materialPublicCode=" + testMaterial1.getPublicCode())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].materialPublicCode").value(testMaterial1.getPublicCode()));
    }

    @Test
    void getGeneralHistoryFilteredByAction() throws Exception {
        mockMvc.perform(get("/api/v1/inventory/history?action=STATUS_CHANGED")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].action").value("STATUS_CHANGED"));
    }

    @Test
    void getMaterialSpecificHistorySuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/inventory/materials/" + testMaterial1.getPublicCode() + "/history")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].materialPublicCode").value(testMaterial1.getPublicCode()))
                .andExpect(jsonPath("$.data.content[0].performedByUserEmail").value(tecnicoUser.getEmail()))
                .andExpect(jsonPath("$.data.content[0].performedByUserFullName").value("Tecnico User"))
                .andExpect(jsonPath("$.data.content[0].newOfficeName").value("Madrid Office"))
                .andExpect(jsonPath("$.data.content[0].newOfficePublicId").value(testOffice1.getPublicId()))
                .andExpect(jsonPath("$.data.content[0].previousStatus").value("OPERATIVO"))
                .andExpect(jsonPath("$.data.content[0].newStatus").value("ROTO"));
    }

    @Test
    void getMaterialSpecificHistoryNonExistentReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/inventory/materials/mat_nonexistentcode/history")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }
}
