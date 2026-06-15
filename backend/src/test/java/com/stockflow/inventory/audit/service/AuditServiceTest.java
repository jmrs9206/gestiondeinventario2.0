package com.stockflow.inventory.audit.service;

import com.stockflow.inventory.audit.entity.AuditLog;
import com.stockflow.inventory.audit.repository.AuditLogRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AuditServiceTest {

    @Autowired
    private AuditService auditService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        auditLogRepository.deleteAll();
    }

    @Test
    void logEventPersistsToDatabaseSuccessfully() {
        auditService.logEvent(
                "Material",
                "mat_123456",
                "MATERIAL_CREATED",
                "USER",
                "user_public_id",
                "127.0.0.1",
                "Mozilla/5.0"
        );

        List<AuditLog> logs = auditLogRepository.findAll();
        assertEquals(1, logs.size());

        AuditLog log = logs.get(0);
        assertEquals("Material", log.getEntityType());
        assertEquals("mat_123456", log.getEntityId());
        assertEquals("MATERIAL_CREATED", log.getAction());
        assertEquals("USER", log.getPerformedByType());
        assertEquals("user_public_id", log.getPerformedById());
        assertEquals("127.0.0.1", log.getIpAddress());
        assertEquals("Mozilla/5.0", log.getUserAgent());
        assertNull(log.getOldValue());
        assertNull(log.getNewValue());
        assertNotNull(log.getCreatedAt());
    }

    @Test
    void logEventWithOldAndNewValuesPersistsSuccessfully() {
        auditService.logEvent(
                "Material",
                "mat_123456",
                "MATERIAL_UPDATED",
                "USER",
                "user_public_id",
                "127.0.0.1",
                "Mozilla/5.0",
                "{\"status\":\"OPERATIVO\"}",
                "{\"status\":\"ROTO\"}"
        );

        List<AuditLog> logs = auditLogRepository.findAll();
        assertEquals(1, logs.size());

        AuditLog log = logs.get(0);
        String oldVal = log.getOldValue();
        if (oldVal.startsWith("\"") && oldVal.endsWith("\"")) {
            oldVal = oldVal.substring(1, oldVal.length() - 1).replace("\\\"", "\"");
        }
        String newVal = log.getNewValue();
        if (newVal.startsWith("\"") && newVal.endsWith("\"")) {
            newVal = newVal.substring(1, newVal.length() - 1).replace("\\\"", "\"");
        }
        assertEquals("{\"status\":\"OPERATIVO\"}", oldVal);
        assertEquals("{\"status\":\"ROTO\"}", newVal);
    }

    @Test
    void logEventTruncatesUserAgentIfTooLong() {
        StringBuilder longUserAgent = new StringBuilder();
        for (int i = 0; i < 600; i++) {
            longUserAgent.append("A");
        }

        auditService.logEvent(
                "Material",
                "mat_123456",
                "MATERIAL_CREATED",
                "USER",
                "user_public_id",
                "127.0.0.1",
                longUserAgent.toString()
        );

        List<AuditLog> logs = auditLogRepository.findAll();
        assertEquals(1, logs.size());

        AuditLog log = logs.get(0);
        assertNotNull(log.getUserAgent());
        assertEquals(500, log.getUserAgent().length());
        assertTrue(log.getUserAgent().startsWith("AAAA"));
    }
}
