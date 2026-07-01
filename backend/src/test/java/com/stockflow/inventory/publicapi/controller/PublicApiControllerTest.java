package com.stockflow.inventory.publicapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.audit.repository.AuditLogRepository;
import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.materials.entity.Material;
import com.stockflow.inventory.materials.repository.MaterialRepository;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import com.stockflow.inventory.publicapi.entity.ApiClient;
import com.stockflow.inventory.publicapi.entity.ApiClientScope;
import com.stockflow.inventory.publicapi.repository.ApiClientRepository;
import com.stockflow.inventory.publicapi.service.PublicApiService;
import com.stockflow.inventory.users.dto.UserCreateRequest;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;
import java.util.List;
import com.stockflow.inventory.audit.entity.AuditLog;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OfficeRepository officeRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private ApiClientRepository apiClientRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PublicApiService publicApiService;

    @Autowired
    private ObjectMapper objectMapper;

    private ApiClient clientMaterials;
    private ApiClient clientUsers;
    private ApiClient clientInactive;

    private static final String KEY_MATERIALS = "stockflow_key_materials_xyz123";
    private static final String KEY_USERS = "stockflow_key_users_abc456";
    private static final String KEY_INACTIVE = "stockflow_key_inactive_789";

    private Office testOffice;
    private Material testMaterial;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        apiClientRepository.deleteAll();
        materialRepository.deleteAll();
        officeRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create client with scope "materials:read"
        clientMaterials = new ApiClient(
                UUID.randomUUID().toString(),
                "Materials Integration Client",
                publicApiService.hashApiKey(KEY_MATERIALS),
                true
        );
        clientMaterials.getScopes().add(new ApiClientScope(clientMaterials, "materials:read"));
        clientMaterials = apiClientRepository.save(clientMaterials);

        // 2. Create client with scope "users:create"
        clientUsers = new ApiClient(
                UUID.randomUUID().toString(),
                "Users Integration Client",
                publicApiService.hashApiKey(KEY_USERS),
                true
        );
        clientUsers.getScopes().add(new ApiClientScope(clientUsers, "users:create"));
        clientUsers = apiClientRepository.save(clientUsers);

        // 3. Create client that is inactive
        clientInactive = new ApiClient(
                UUID.randomUUID().toString(),
                "Inactive Client",
                publicApiService.hashApiKey(KEY_INACTIVE),
                false
        );
        clientInactive.getScopes().add(new ApiClientScope(clientInactive, "materials:read"));
        clientInactive = apiClientRepository.save(clientInactive);

        // 4. Create dummy inventory data for retrieval
        testOffice = new Office(UUID.randomUUID().toString(), "Public API Test Office");
        testOffice.setActive(true);
        testOffice = officeRepository.save(testOffice);

        testMaterial = new Material(
                "mat_public_api_test",
                "Laptop",
                "Dell",
                "Latitude",
                "SN-PUB-1",
                testOffice,
                MaterialStatus.OPERATIVO
        );
        testMaterial.setActive(true);
        testMaterial = materialRepository.save(testMaterial);
    }

    @AfterEach
    void tearDown() {
        auditLogRepository.deleteAll();
        apiClientRepository.deleteAll();
        materialRepository.deleteAll();
        officeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void accessWithoutApiKeyReturns401() throws Exception {
        mockMvc.perform(get("/public-api/v1/materials"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accessWithInvalidApiKeyReturns401() throws Exception {
        mockMvc.perform(get("/public-api/v1/materials")
                        .header("X-API-Key", "invalid_key_value"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accessWithInactiveClientKeyReturns401() throws Exception {
        mockMvc.perform(get("/public-api/v1/materials")
                        .header("X-API-Key", KEY_INACTIVE))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accessWithValidKeyAndRequiredScopeSucceeds() throws Exception {
        mockMvc.perform(get("/public-api/v1/materials")
                        .header("X-API-Key", KEY_MATERIALS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].publicCode").value(testMaterial.getPublicCode()));

        // Check lastUsedAt was updated
        ApiClient updatedClient = apiClientRepository.findById(clientMaterials.getId()).orElseThrow();
        assertNotNull(updatedClient.getLastUsedAt());

        // Check audit log was written
        List<AuditLog> logs = auditLogRepository.findAll().stream()
                .filter(log -> log.getAction().equals("PUBLIC_API_ACCESS"))
                .toList();
        assertEquals(1, logs.size());
        AuditLog accessLog = logs.get(0);
        assertEquals("API_CLIENT", accessLog.getPerformedByType());
        assertEquals(clientMaterials.getPublicId(), accessLog.getPerformedById());
        assertEquals("ApiClient", accessLog.getEntityType());
        assertEquals(clientMaterials.getPublicId(), accessLog.getEntityId());
    }

    @Test
    void accessWithValidKeyButMissingScopeReturns403() throws Exception {
        UserCreateRequest request = new UserCreateRequest();
        request.setFirstName("External");
        request.setLastName("User");
        request.setEmail("external_user_forbidden@tuempresa.com");
        request.setPassword("SecurePass123!");
        request.setRole(Role.TECNICO);

        mockMvc.perform(post("/public-api/v1/users")
                        .header("X-API-Key", KEY_MATERIALS)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createUserWithValidKeyAndScopeSucceeds() throws Exception {
        UserCreateRequest request = new UserCreateRequest();
        request.setFirstName("External");
        request.setLastName("User");
        request.setEmail("external_user@tuempresa.com");
        request.setPassword("SecurePass123!");
        request.setRole(Role.TECNICO);

        mockMvc.perform(post("/public-api/v1/users")
                        .header("X-API-Key", KEY_USERS)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email").value("external_user@tuempresa.com"))
                .andExpect(jsonPath("$.data.firstName").value("EXTERNAL"));

        // Verify user is in DB
        assertTrue(userRepository.findByEmail("external_user@tuempresa.com").isPresent());

        // Check audit log contains access log AND user creation log
        List<AuditLog> logs = auditLogRepository.findAll();
        long auditCount = logs.stream()
                .filter(log -> log.getAction().equals("PUBLIC_API_ACCESS") || log.getAction().equals("USER_CREATED"))
                .count();
        assertEquals(2, auditCount);

        AuditLog accessLog = logs.stream()
                .filter(log -> log.getAction().equals("PUBLIC_API_ACCESS"))
                .findFirst().orElseThrow();
        assertEquals("API_CLIENT", accessLog.getPerformedByType());
        assertEquals(clientUsers.getPublicId(), accessLog.getPerformedById());

        AuditLog userCreatedLog = logs.stream()
                .filter(log -> log.getAction().equals("USER_CREATED"))
                .findFirst().orElseThrow();
        assertEquals("API_CLIENT", userCreatedLog.getPerformedByType());
        assertEquals(clientUsers.getPublicId(), userCreatedLog.getPerformedById());
    }
}
