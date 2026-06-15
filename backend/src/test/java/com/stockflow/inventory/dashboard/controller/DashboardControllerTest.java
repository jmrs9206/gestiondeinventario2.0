package com.stockflow.inventory.dashboard.controller;

import com.stockflow.inventory.auth.service.JwtService;
import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.inventory.entity.MaterialHistory;
import com.stockflow.inventory.inventory.repository.MaterialHistoryRepository;
import com.stockflow.inventory.materials.entity.Material;
import com.stockflow.inventory.materials.repository.MaterialRepository;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DashboardControllerTest {

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

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User adminUser;
    private User tecnicoUser;
    private String adminToken;
    private String tecnicoToken;
    private Office activeOffice;
    private Office inactiveOffice;

    @BeforeEach
    void setUp() {
        materialHistoryRepository.deleteAll();
        materialRepository.deleteAll();
        officeRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Users
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

        adminToken = jwtService.generateToken(adminUser.getEmail(), adminUser.getPublicId(), Role.ADMIN.name());
        tecnicoToken = jwtService.generateToken(tecnicoUser.getEmail(), tecnicoUser.getPublicId(), Role.TECNICO.name());

        // 2. Create Offices
        activeOffice = new Office(UUID.randomUUID().toString(), "Active Office");
        activeOffice.setActive(true);
        activeOffice = officeRepository.save(activeOffice);

        inactiveOffice = new Office(UUID.randomUUID().toString(), "Inactive Office");
        inactiveOffice.setActive(false);
        inactiveOffice = officeRepository.save(inactiveOffice);

        // 3. Create Materials
        // Active, status OPERATIVO
        Material mat1 = new Material("mat_1", "Router", "MikroTik", "RB4011", "SN1", activeOffice, MaterialStatus.OPERATIVO);
        mat1.setActive(true);
        mat1 = materialRepository.save(mat1);

        // Active, status ROTO
        Material mat2 = new Material("mat_2", "Switch", "Cisco", "Catalyst", "SN2", activeOffice, MaterialStatus.ROTO);
        mat2.setActive(true);
        mat2 = materialRepository.save(mat2);

        // Active, status EN_REPARACION
        Material mat3 = new Material("mat_3", "Access Point", "Ubiquiti", "UAP-AC-PRO", "SN3", activeOffice, MaterialStatus.EN_REPARACION);
        mat3.setActive(true);
        mat3 = materialRepository.save(mat3);

        // Inactive, status BAJA
        Material mat4 = new Material("mat_4", "Laptop", "HP", "ProBook", "SN4", activeOffice, MaterialStatus.BAJA);
        mat4.setActive(false);
        mat4 = materialRepository.save(mat4);

        // 4. Create History Transitions for Repair Calculations
        LocalDateTime baseTime = LocalDateTime.now();

        // Material 2 repair cycle (completed: 2 hours)
        MaterialHistory mh2Start = new MaterialHistory(mat2, "STATUS_CHANGED", MaterialStatus.OPERATIVO, MaterialStatus.EN_REPARACION, activeOffice, activeOffice, "Sent to repair", adminUser);
        mh2Start = materialHistoryRepository.save(mh2Start);
        updateHistoryCreatedAt(mh2Start.getId(), baseTime.minusHours(5));

        MaterialHistory mh2End = new MaterialHistory(mat2, "STATUS_CHANGED", MaterialStatus.EN_REPARACION, MaterialStatus.OPERATIVO, activeOffice, activeOffice, "Repaired", adminUser);
        mh2End = materialHistoryRepository.save(mh2End);
        updateHistoryCreatedAt(mh2End.getId(), baseTime.minusHours(3));

        // Material 3 repair cycle (completed: 3 hours)
        MaterialHistory mh3Start = new MaterialHistory(mat3, "STATUS_CHANGED", MaterialStatus.OPERATIVO, MaterialStatus.EN_REPARACION, activeOffice, activeOffice, "Sent to repair", adminUser);
        mh3Start = materialHistoryRepository.save(mh3Start);
        updateHistoryCreatedAt(mh3Start.getId(), baseTime.minusHours(4));

        MaterialHistory mh3End = new MaterialHistory(mat3, "STATUS_CHANGED", MaterialStatus.EN_REPARACION, MaterialStatus.OPERATIVO, activeOffice, activeOffice, "Repaired", adminUser);
        mh3End = materialHistoryRepository.save(mh3End);
        updateHistoryCreatedAt(mh3End.getId(), baseTime.minusHours(1));

        // Material 3 ongoing repair (incomplete - shouldn't count in finished repair time average)
        MaterialHistory mh3Ongoing = new MaterialHistory(mat3, "STATUS_CHANGED", MaterialStatus.OPERATIVO, MaterialStatus.EN_REPARACION, activeOffice, activeOffice, "Sent to repair again", adminUser);
        mh3Ongoing = materialHistoryRepository.save(mh3Ongoing);
        updateHistoryCreatedAt(mh3Ongoing.getId(), baseTime.minusMinutes(30));
    }

    private void updateHistoryCreatedAt(Long id, LocalDateTime dateTime) {
        jdbcTemplate.update("UPDATE material_history SET created_at = ? WHERE id = ?",
                java.sql.Timestamp.valueOf(dateTime), id);
    }

    @AfterEach
    void tearDown() {
        materialHistoryRepository.deleteAll();
        materialRepository.deleteAll();
        officeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getKpisUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/kpis"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getKpisAsTecnicoReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/kpis")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getKpisAsAdminReturns200AndCorrectMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/kpis")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalMaterials").value(3)) // mat1, mat2, mat3 are active
                .andExpect(jsonPath("$.data.incidencesCount").value(2)) // mat2 (ROTO) and mat3 (EN_REPARACION) are active
                // Status counts breakdown (both active & inactive count)
                .andExpect(jsonPath("$.data.statusCounts.OPERATIVO").value(1))
                .andExpect(jsonPath("$.data.statusCounts.ROTO").value(1))
                .andExpect(jsonPath("$.data.statusCounts.EN_REPARACION").value(1))
                .andExpect(jsonPath("$.data.statusCounts.BAJA").value(1))
                // Office counts (only active office count is returned, inactive office is ignored)
                .andExpect(jsonPath("$.data.officeCounts", hasSize(1)))
                .andExpect(jsonPath("$.data.officeCounts[0].name").value("Active Office"))
                .andExpect(jsonPath("$.data.officeCounts[0].count").value(3))
                // Mean repair time (2.0 + 3.0) / 2 = 2.5 hours
                .andExpect(jsonPath("$.data.meanRepairTimeInHours").value(closeTo(2.5, 0.01)));
    }
}
