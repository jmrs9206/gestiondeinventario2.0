package com.stockflow.inventory.config;

import com.stockflow.inventory.common.utils.TextNormalizer;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class OwnerAccountInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String ownerEmail;
    private final String ownerPassword;

    public OwnerAccountInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.owner.email:${ADMIN_EMAIL:admin@tuempresa.com}}") String ownerEmail,
            @Value("${ADMIN_PASSWORD:vd_admin_z2X4m7P1v9R8s3T5}") String ownerPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.ownerEmail = normalizeEmail(ownerEmail);
        this.ownerPassword = ownerPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        userRepository.findByEmail(ownerEmail).ifPresentOrElse(this::repairOwnerAccount, this::createOwnerAccount);
    }

    private void repairOwnerAccount(User owner) {
        boolean changed = false;

        if (!owner.isActive()) {
            owner.setActive(true);
            changed = true;
        }

        if (owner.getRole() != Role.ADMIN) {
            owner.setRole(Role.ADMIN);
            changed = true;
        }

        if (owner.isMustChangePassword()) {
            owner.setMustChangePassword(false);
            changed = true;
        }

        if (changed) {
            userRepository.save(owner);
        }
    }

    private void createOwnerAccount() {
        User owner = new User(
                UUID.randomUUID().toString(),
                "OWNER",
                "ADMIN",
                ownerEmail,
                passwordEncoder.encode(ownerPassword),
                Role.ADMIN
        );
        owner.setActive(true);
        owner.setMustChangePassword(false);
        userRepository.save(owner);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return "admin@tuempresa.com";
        }
        return TextNormalizer.normalize(email).toLowerCase();
    }
}
