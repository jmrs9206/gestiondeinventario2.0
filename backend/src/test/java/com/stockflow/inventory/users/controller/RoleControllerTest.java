package com.stockflow.inventory.users.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.users.entity.RolePermission;
import com.stockflow.inventory.users.repository.RolePermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RolePermissionRepository rolePermissionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private List<RolePermission> mockPermissions;

    @BeforeEach
    void setUp() {
        mockPermissions = Arrays.asList(
                new RolePermission("ADMIN", "CREATE_USER"),
                new RolePermission("ADMIN", "READ_USER"),
                new RolePermission("TECNICO", "CREATE_MATERIAL")
        );
    }

    @Test
    @WithMockUser(authorities = "MANAGE_ROLES")
    void getRolesAndPermissionsSuccessfully() throws Exception {
        when(rolePermissionRepository.findAll()).thenReturn(mockPermissions);

        mockMvc.perform(get("/api/v1/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ADMIN").isArray())
                .andExpect(jsonPath("$.data.ADMIN[0]").value("CREATE_USER"))
                .andExpect(jsonPath("$.data.ADMIN[1]").value("READ_USER"))
                .andExpect(jsonPath("$.data.TECNICO[0]").value("CREATE_MATERIAL"));

        verify(rolePermissionRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser(authorities = "READ_USER") // Missing MANAGE_ROLES
    void getRolesAndPermissionsMissingAuthorityReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/roles"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getRolesAndPermissionsUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/roles"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "MANAGE_ROLES")
    void updateRolePermissionsSuccessfully() throws Exception {
        List<String> newPermissions = Arrays.asList("CREATE_USER", "READ_USER", "UPDATE_USER");
        
        doNothing().when(rolePermissionRepository).deleteByRole("ADMIN");
        when(rolePermissionRepository.saveAll(anyList())).thenReturn(Arrays.asList());
        when(rolePermissionRepository.findAll()).thenReturn(Arrays.asList(
                new RolePermission("ADMIN", "CREATE_USER"),
                new RolePermission("ADMIN", "READ_USER"),
                new RolePermission("ADMIN", "UPDATE_USER")
        ));

        mockMvc.perform(put("/api/v1/roles/ADMIN/permissions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPermissions)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ADMIN").isArray())
                .andExpect(jsonPath("$.data.ADMIN[0]").value("CREATE_USER"))
                .andExpect(jsonPath("$.data.ADMIN[1]").value("READ_USER"))
                .andExpect(jsonPath("$.data.ADMIN[2]").value("UPDATE_USER"));

        verify(rolePermissionRepository, times(1)).deleteByRole("ADMIN");
        verify(rolePermissionRepository, times(1)).saveAll(anyList());
    }

    @Test
    @WithMockUser(authorities = "MANAGE_ROLES")
    void updateRolePermissionsInvalidRoleReturnsBadRequest() throws Exception {
        mockMvc.perform(put("/api/v1/roles/INVALID_ROLE/permissions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Arrays.asList("READ_USER"))))
                .andExpect(status().isBadRequest());
    }
}
