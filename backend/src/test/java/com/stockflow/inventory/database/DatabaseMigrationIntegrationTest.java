package com.stockflow.inventory.database;

import com.stockflow.inventory.AbstractIntegrationTest;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@EnabledIf("com.stockflow.inventory.AbstractIntegrationTest#isDockerAvailable")
class DatabaseMigrationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private OfficeRepository officeRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFlywayMigrationsAndOfficeCrudOnMySql() {
        // Setup office entity
        String officeId = UUID.randomUUID().toString();
        Office office = new Office(officeId, "Sede Testcontainers");
        office.setActive(true);

        // Save
        Office saved = officeRepository.save(office);
        assertEquals("Sede Testcontainers", saved.getName());

        // Find
        Optional<Office> found = officeRepository.findByPublicId(officeId);
        assertTrue(found.isPresent());
        assertEquals("Sede Testcontainers", found.get().getName());

        // Clean up
        officeRepository.delete(saved);
        assertTrue(officeRepository.findByPublicId(officeId).isEmpty());
    }

    @Test
    void testUserCrudOnMySql() {
        String userId = UUID.randomUUID().toString();
        User user = new User(
                userId,
                "Integration",
                "Tester",
                "integration.tester@tuempresa.com",
                "EncryptedPassword123",
                Role.TECNICO
        );
        user.setActive(true);

        User saved = userRepository.save(user);
        assertEquals("integration.tester@tuempresa.com", saved.getEmail());

        Optional<User> found = userRepository.findByEmail("integration.tester@tuempresa.com");
        assertTrue(found.isPresent());
        assertEquals(userId, found.get().getPublicId());

        userRepository.delete(saved);
        assertTrue(userRepository.findByEmail("integration.tester@tuempresa.com").isEmpty());
    }
}
