package com.vdenergy.inventory.database;

import com.vdenergy.inventory.AbstractIntegrationTest;
import com.vdenergy.inventory.offices.entity.Office;
import com.vdenergy.inventory.offices.repository.OfficeRepository;
import com.vdenergy.inventory.users.entity.Role;
import com.vdenergy.inventory.users.entity.User;
import com.vdenergy.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
                "integration.tester@vdenergy.es",
                "EncryptedPassword123",
                Role.TECNICO
        );
        user.setActive(true);

        User saved = userRepository.save(user);
        assertEquals("integration.tester@vdenergy.es", saved.getEmail());

        Optional<User> found = userRepository.findByEmail("integration.tester@vdenergy.es");
        assertTrue(found.isPresent());
        assertEquals(userId, found.get().getPublicId());

        userRepository.delete(saved);
        assertTrue(userRepository.findByEmail("integration.tester@vdenergy.es").isEmpty());
    }
}
