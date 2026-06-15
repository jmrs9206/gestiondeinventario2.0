package com.stockflow.inventory.common.exceptions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.audit.entity.AuditLog;
import com.stockflow.inventory.audit.repository.AuditLogRepository;
import com.stockflow.inventory.users.dto.UserCreateRequest;
import com.stockflow.inventory.users.dto.UserResponse;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.repository.UserRepository;
import com.stockflow.inventory.users.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GlobalExceptionAndAuditIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @SpyBean
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        auditLogRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
        auditLogRepository.deleteAll();
    }

    @Test
    void malformedJsonReturnsBadRequestWithMalformedJsonCode() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid-json}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("MALFORMED_JSON"))
                .andExpect(jsonPath("$.error.message").value("Required request body is missing or malformed"));
    }

    @Test
    void unsupportedMethodReturnsMethodNotAllowed() throws Exception {
        // Auth login only supports POST
        mockMvc.perform(get("/api/v1/auth/login"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.error.code").value("METHOD_NOT_ALLOWED"));
    }

    @Test
    void auditSaveFailureDoesNotRollbackBusinessTransaction() {
        // Force auditLogRepository.save to throw an exception
        doThrow(new RuntimeException("Database down for auditing only"))
                .when(auditLogRepository).save(any(AuditLog.class));

        UserCreateRequest request = new UserCreateRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe.robustness@tuempresa.com");
        request.setPassword("SecurePassword123!");
        request.setRole(Role.TECNICO);

        // Call createUser, which will trigger audit logging
        UserResponse response = userService.createUser(
                request,
                "some-performer",
                "127.0.0.1",
                "Test-Agent"
        );

        // The user should be returned and saved in the DB, despite the audit failure
        assertNotNull(response);
        assertTrue(userRepository.findByEmail("john.doe.robustness@tuempresa.com").isPresent());
    }
}
