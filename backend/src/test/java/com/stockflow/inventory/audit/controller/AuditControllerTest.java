package com.stockflow.inventory.audit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.audit.entity.AuditLog;
import com.stockflow.inventory.audit.repository.AuditLogRepository;
import com.stockflow.inventory.auth.service.JwtService;
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

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User adminUser;
    private User tecnicoUser;
    private String adminToken;
    private String tecnicoToken;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        userRepository.deleteAll();

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

        // Insert some dummy audit logs
        AuditLog log1 = new AuditLog(
                "Material",
                "mat_1",
                "MATERIAL_CREATED",
                "USER",
                adminUser.getPublicId(),
                "127.0.0.1",
                "Mozilla/5.0",
                null,
                "{\"status\": \"OPERATIVO\"}"
        );
        auditLogRepository.save(log1);

        AuditLog log2 = new AuditLog(
                "User",
                tecnicoUser.getPublicId(),
                "USER_CREATED",
                "USER",
                adminUser.getPublicId(),
                "127.0.0.1",
                "Mozilla/5.0",
                null,
                "{\"email\": \"tecnico@tuempresa.com\"}"
        );
        auditLogRepository.save(log2);
    }

    @Test
    void adminCanGetAuditLogs() throws Exception {
        mockMvc.perform(get("/api/v1/audit")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].entityType").value("Material"))
                .andExpect(jsonPath("$.data.content[0].entityId").value("mat_1"))
                .andExpect(jsonPath("$.data.content[0].action").value("MATERIAL_CREATED"))
                .andExpect(jsonPath("$.data.content[1].entityType").value("User"))
                .andExpect(jsonPath("$.data.content[0].id").doesNotExist()); // Ensure internal database ID is not exposed
    }

    @Test
    void tecnicoCannotGetAuditLogs() throws Exception {
        mockMvc.perform(get("/api/v1/audit")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedCannotGetAuditLogs() throws Exception {
        mockMvc.perform(get("/api/v1/audit"))
                .andExpect(status().isUnauthorized());
    }
}
