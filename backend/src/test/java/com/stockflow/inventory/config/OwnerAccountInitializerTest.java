package com.stockflow.inventory.config;

import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OwnerAccountInitializerTest {

    @Test
    void createsOwnerAccountWhenMissing() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(userRepository.findByEmail("owner@tuempresa.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("OwnerPassword123")).thenReturn("hashed-owner-password");

        OwnerAccountInitializer initializer = new OwnerAccountInitializer(
                userRepository,
                passwordEncoder,
                "owner@tuempresa.com",
                "OwnerPassword123"
        );

        initializer.run();

        verify(userRepository).save(any(User.class));
    }

    @Test
    void repairsExistingOwnerWithoutResettingPassword() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        User owner = new User("owner-id", "Owner", "Admin", "owner@tuempresa.com", "existing-hash", Role.TECNICO);
        owner.setActive(false);
        owner.setMustChangePassword(true);

        when(userRepository.findByEmail("owner@tuempresa.com")).thenReturn(Optional.of(owner));

        OwnerAccountInitializer initializer = new OwnerAccountInitializer(
                userRepository,
                passwordEncoder,
                "owner@tuempresa.com",
                "OwnerPassword123"
        );

        initializer.run();

        assertTrue(owner.isActive());
        assertEquals(Role.ADMIN, owner.getRole());
        assertFalse(owner.isMustChangePassword());
        assertEquals("existing-hash", owner.getPasswordHash());
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository).save(owner);
    }
}
