package com.stockflow.inventory.materials.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.auth.service.JwtService;
import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.inventory.entity.MaterialHistory;
import com.stockflow.inventory.inventory.repository.MaterialHistoryRepository;
import com.stockflow.inventory.materials.dto.MaterialRequest;
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
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MaterialControllerTest {

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
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @SpyBean
    private AuditService auditService;

    private User adminUser;
    private User tecnicoUser;
    private String adminToken;
    private String tecnicoToken;
    private Office testOffice1;
    private Office testOffice2;

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

        // Test Offices
        testOffice1 = new Office(UUID.randomUUID().toString(), "Madrid Office");
        testOffice1.setActive(true);
        testOffice1 = officeRepository.save(testOffice1);

        testOffice2 = new Office(UUID.randomUUID().toString(), "Barcelona Office");
        testOffice2.setActive(true);
        testOffice2 = officeRepository.save(testOffice2);

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
    void listMaterialsUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/materials"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createMaterialSuccessfullyByAdmin() throws Exception {
        MaterialRequest request = new MaterialRequest();
        request.setMaterialType("Router");
        request.setBrand("MikroTik");
        request.setModel("RB4011");
        request.setSerialNumber("SN123456789");
        request.setOfficePublicId(testOffice1.getPublicId());
        request.setStatus(MaterialStatus.OPERATIVO);
        request.setComment("Initial provisioning");

        mockMvc.perform(post("/api/v1/materials")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.publicCode").isNotEmpty())
                .andExpect(jsonPath("$.data.materialType").value("ROUTER"))
                .andExpect(jsonPath("$.data.brand").value("MIKROTIK"))
                .andExpect(jsonPath("$.data.model").value("RB4011"))
                .andExpect(jsonPath("$.data.serialNumber").value("SN123456789"))
                .andExpect(jsonPath("$.data.office.publicId").value(testOffice1.getPublicId()))
                .andExpect(jsonPath("$.data.status").value("OPERATIVO"))
                .andExpect(jsonPath("$.data.active").value(true));

        // Retrieve created material
        List<Material> materials = materialRepository.findAll();
        assertEquals(1, materials.size());
        Material material = materials.get(0);
        assertNotNull(material.getPublicCode());
        assertEquals(24, material.getPublicCode().length());

        // Verify history record
        List<MaterialHistory> histories = materialHistoryRepository.findAll();
        assertEquals(1, histories.size());
        MaterialHistory history = histories.get(0);
        assertEquals(material.getId(), history.getMaterial().getId());
        assertEquals("MATERIAL_CREATED", history.getAction());
        assertNull(history.getPreviousStatus());
        assertEquals(MaterialStatus.OPERATIVO, history.getNewStatus());
        assertNull(history.getPreviousOffice());
        assertEquals(testOffice1.getId(), history.getNewOffice().getId());
        assertEquals("INITIAL PROVISIONING", history.getComment());
        assertEquals(adminUser.getId(), history.getPerformedByUser().getId());

        // Verify audit log
        verify(auditService, times(1)).logEvent(
                eq("Material"),
                eq(material.getPublicCode()),
                eq("MATERIAL_CREATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void createMaterialSuccessfullyByTecnico() throws Exception {
        MaterialRequest request = new MaterialRequest();
        request.setMaterialType("Switch");
        request.setBrand("Cisco");
        request.setModel("Catalyst 2960");
        request.setSerialNumber("SN987654321");
        request.setOfficePublicId(testOffice2.getPublicId());
        request.setStatus(MaterialStatus.EN_REPARACION);
        request.setComment("Faulty switch");

        mockMvc.perform(post("/api/v1/materials")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.publicCode").isNotEmpty())
                .andExpect(jsonPath("$.data.materialType").value("SWITCH"))
                .andExpect(jsonPath("$.data.office.publicId").value(testOffice2.getPublicId()))
                .andExpect(jsonPath("$.data.status").value("EN_REPARACION"));

        List<Material> materials = materialRepository.findAll();
        assertEquals(1, materials.size());
        Material material = materials.get(0);

        verify(auditService, times(1)).logEvent(
                eq("Material"),
                eq(material.getPublicCode()),
                eq("MATERIAL_CREATED"),
                eq("USER"),
                eq(tecnicoUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void createMaterialWithNonExistentOfficeReturns404() throws Exception {
        MaterialRequest request = new MaterialRequest();
        request.setMaterialType("Router");
        request.setOfficePublicId("non-existent-office-uuid");
        request.setStatus(MaterialStatus.OPERATIVO);

        mockMvc.perform(post("/api/v1/materials")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void createMaterialWithMissingFieldsReturns400() throws Exception {
        MaterialRequest request = new MaterialRequest();
        request.setMaterialType(""); // blank
        request.setOfficePublicId(testOffice1.getPublicId());
        request.setStatus(null); // null

        mockMvc.perform(post("/api/v1/materials")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_FAILED"));
    }

    @Test
    void getMaterialDetailsSuccessfully() throws Exception {
        Material material = new Material(
                "mat_12345678901234567890",
                "Access Point",
                "Ubiquiti",
                "UAP-AC-PRO",
                "SN-UAP123",
                testOffice1,
                MaterialStatus.OPERATIVO
        );
        material.setActive(true);
        material = materialRepository.save(material);

        mockMvc.perform(get("/api/v1/materials/" + material.getPublicCode())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.publicCode").value(material.getPublicCode()))
                .andExpect(jsonPath("$.data.materialType").value("Access Point"))
                .andExpect(jsonPath("$.data.brand").value("Ubiquiti"));
    }

    @Test
    void getMaterialDetailsNonExistentReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/materials/mat_nonexistentcode")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void listMaterialsWithFilters() throws Exception {
        Material material1 = new Material("mat_11111111111111111111", "Router", "MikroTik", "RB4011", "SN111", testOffice1, MaterialStatus.OPERATIVO);
        material1.setActive(true);
        materialRepository.save(material1);

        Material material2 = new Material("mat_22222222222222222222", "Switch", "Cisco", "Catalyst", "SN222", testOffice2, MaterialStatus.EN_REPARACION);
        material2.setActive(true);
        materialRepository.save(material2);

        // Filter by type "router" (case-insensitive & partial match)
        mockMvc.perform(get("/api/v1/materials?materialType=rout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].publicCode").value("mat_11111111111111111111"));

        // Filter by office
        mockMvc.perform(get("/api/v1/materials?officePublicId=" + testOffice2.getPublicId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].publicCode").value("mat_22222222222222222222"));

        // Filter by status
        mockMvc.perform(get("/api/v1/materials?status=EN_REPARACION")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].publicCode").value("mat_22222222222222222222"));

        // Filter by serialNumber
        mockMvc.perform(get("/api/v1/materials?serialNumber=SN111")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].publicCode").value("mat_11111111111111111111"));
    }

    @Test
    void updateMaterialSuccessfullyWithOfficeAndStatusChange() throws Exception {
        Material material = new Material(
                "mat_12345678901234567890",
                "Access Point",
                "Ubiquiti",
                "UAP-AC-PRO",
                "SN-UAP123",
                testOffice1,
                MaterialStatus.OPERATIVO
        );
        material.setActive(true);
        material = materialRepository.save(material);

        reset(auditService);

        MaterialRequest request = new MaterialRequest();
        request.setMaterialType("Access Point PRO");
        request.setBrand("Ubiquiti Corp");
        request.setModel("UAP-AC-PRO-V2");
        request.setSerialNumber("SN-UAP123-MOD");
        request.setOfficePublicId(testOffice2.getPublicId()); // office changed
        request.setStatus(MaterialStatus.ROTO); // status changed
        request.setComment("Damaged during transfer");

        mockMvc.perform(put("/api/v1/materials/" + material.getPublicCode())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.materialType").value("ACCESS POINT PRO"))
                .andExpect(jsonPath("$.data.brand").value("UBIQUITI CORP"))
                .andExpect(jsonPath("$.data.office.publicId").value(testOffice2.getPublicId()))
                .andExpect(jsonPath("$.data.status").value("ROTO"));

        // Verify history record
        List<MaterialHistory> histories = materialHistoryRepository.findAll();
        assertEquals(1, histories.size());
        MaterialHistory history = histories.get(0);
        assertEquals(material.getId(), history.getMaterial().getId());
        assertEquals("STATUS_AND_OFFICE_CHANGED", history.getAction());
        assertEquals(MaterialStatus.OPERATIVO, history.getPreviousStatus());
        assertEquals(MaterialStatus.ROTO, history.getNewStatus());
        assertEquals(testOffice1.getId(), history.getPreviousOffice().getId());
        assertEquals(testOffice2.getId(), history.getNewOffice().getId());
        assertEquals("DAMAGED DURING TRANSFER", history.getComment());
        assertEquals(adminUser.getId(), history.getPerformedByUser().getId());

        // Verify audits
        verify(auditService, times(1)).logEvent(
                eq("Material"),
                eq(material.getPublicCode()),
                eq("STATUS_CHANGED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );

        verify(auditService, times(1)).logEvent(
                eq("Material"),
                eq(material.getPublicCode()),
                eq("OFFICE_CHANGED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );

        verify(auditService, times(1)).logEvent(
                eq("Material"),
                eq(material.getPublicCode()),
                eq("MATERIAL_UPDATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void decommissionMaterialSuccessfully() throws Exception {
        Material material = new Material(
                "mat_12345678901234567890",
                "Access Point",
                "Ubiquiti",
                "UAP-AC-PRO",
                "SN-UAP123",
                testOffice1,
                MaterialStatus.OPERATIVO
        );
        material.setActive(true);
        material = materialRepository.save(material);

        reset(auditService);

        mockMvc.perform(delete("/api/v1/materials/" + material.getPublicCode())
                        .param("comment", "Decommissioning old hardware")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false))
                .andExpect(jsonPath("$.data.status").value("BAJA"));

        // Verify it is no longer listed (default specification lists active = true)
        mockMvc.perform(get("/api/v1/materials")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));

        // Verify details lookup returns 404 since it's inactive
        mockMvc.perform(get("/api/v1/materials/" + material.getPublicCode())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tecnicoToken))
                .andExpect(status().isNotFound());

        // Verify history record
        List<MaterialHistory> histories = materialHistoryRepository.findAll();
        assertEquals(1, histories.size());
        MaterialHistory history = histories.get(0);
        assertEquals(material.getId(), history.getMaterial().getId());
        assertEquals("MATERIAL_DECOMMISSIONED", history.getAction());
        assertEquals(MaterialStatus.OPERATIVO, history.getPreviousStatus());
        assertEquals(MaterialStatus.BAJA, history.getNewStatus());
        assertEquals(testOffice1.getId(), history.getPreviousOffice().getId());
        assertEquals(testOffice1.getId(), history.getNewOffice().getId());
        assertEquals("DECOMMISSIONING OLD HARDWARE", history.getComment());
        assertEquals(tecnicoUser.getId(), history.getPerformedByUser().getId());

        // Verify audit
        verify(auditService, times(1)).logEvent(
                eq("Material"),
                eq(material.getPublicCode()),
                eq("MATERIAL_DECOMMISSIONED"),
                eq("USER"),
                eq(tecnicoUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void exportMaterialsSuccessfully() throws Exception {
        Material material = new Material(
                "mat_12345678901234567890",
                "Access Point",
                "Ubiquiti",
                "UAP-AC-PRO",
                "SN-UAP123",
                testOffice1,
                MaterialStatus.OPERATIVO
        );
        material.setActive(true);
        materialRepository.save(material);

        mockMvc.perform(get("/api/v1/materials/export")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("publicCode,materialType,brand,model,serialNumber,officeName,status,active")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("mat_12345678901234567890,Access Point,Ubiquiti,UAP-AC-PRO,SN-UAP123,Madrid Office,OPERATIVO,true")));
    }

    @Test
    void importMaterialsSuccessfully() throws Exception {
        String csvContent = "materialType,brand,model,serialNumber,officeName,status\n" +
                "Switch,Cisco,Catalyst,SN-IMPORT-999,Madrid Office,EN_REPARACION\n" +
                "Router,Juniper,MX240,SN-IMPORT-888,Sevilla Office,OPERATIVO\n";
        
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file",
                "materials.csv",
                "text/csv",
                csvContent.getBytes(java.nio.charset.StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/v1/materials/import")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Importación masiva completada con éxito"));

        // Verify database contents
        List<Material> materials = materialRepository.findAll();
        long importCount = materials.stream()
                .filter(m -> m.getSerialNumber().startsWith("SN-IMPORT"))
                .count();
        assertEquals(2, importCount);

        // Check Sevilla Office was created dynamically
        assertTrue(officeRepository.findByNameIgnoreCase("Sevilla Office").isPresent());
    }

    @Test
    void reactivateMaterialSuccessfully() throws Exception {
        Material material = new Material(
                "mat_12345678901234567890",
                "Access Point",
                "Ubiquiti",
                "UAP-AC-PRO",
                "SN-UAP123",
                testOffice1,
                MaterialStatus.OPERATIVO
        );
        material.setActive(true);
        material = materialRepository.save(material);

        // Decommission it first
        mockMvc.perform(delete("/api/v1/materials/" + material.getPublicCode())
                        .param("comment", "Decommissioning old hardware")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk());

        reset(auditService);

        // Reactivate it
        mockMvc.perform(post("/api/v1/materials/" + material.getPublicCode() + "/reactivate")
                        .param("comment", "Reactivating hardware")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(true))
                .andExpect(jsonPath("$.data.status").value("OPERATIVO"));

        // Verify it is listed in active materials again
        mockMvc.perform(get("/api/v1/materials")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1));

        verify(auditService, times(1)).logEvent(
                eq("Material"),
                eq(material.getPublicCode()),
                eq("MATERIAL_REACTIVATED"),
                eq("USER"),
                eq(adminUser.getPublicId()),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void listMaterialsWithIncludeInactiveReturnsAll() throws Exception {
        Material material = new Material(
                "mat_12345678901234567890",
                "Access Point",
                "Ubiquiti",
                "UAP-AC-PRO",
                "SN-UAP123",
                testOffice1,
                MaterialStatus.OPERATIVO
        );
        material.setActive(true);
        material = materialRepository.save(material);

        // Decommission it
        mockMvc.perform(delete("/api/v1/materials/" + material.getPublicCode())
                        .param("comment", "Decommissioning old hardware")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk());

        // List with default includeInactive (false)
        mockMvc.perform(get("/api/v1/materials")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));

        // List with includeInactive = true
        mockMvc.perform(get("/api/v1/materials")
                        .param("includeInactive", "true")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].active").value(false))
                .andExpect(jsonPath("$.data.content[0].status").value("BAJA"));
    }
}
