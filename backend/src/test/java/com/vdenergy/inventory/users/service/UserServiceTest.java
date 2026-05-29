package com.vdenergy.inventory.users.service;

import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.auth.repository.RefreshTokenRepository;
import com.vdenergy.inventory.common.exceptions.ConflictException;
import com.vdenergy.inventory.common.exceptions.ResourceNotFoundException;
import com.vdenergy.inventory.users.dto.UserCreateRequest;
import com.vdenergy.inventory.users.dto.UserResponse;
import com.vdenergy.inventory.users.entity.Role;
import com.vdenergy.inventory.users.entity.User;
import com.vdenergy.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, refreshTokenRepository, passwordEncoder, auditService);
    }

    @Test
    void createUserSuccessful() {
        UserCreateRequest request = new UserCreateRequest();
        request.setFirstName("Laura");
        request.setLastName("Gomez");
        request.setEmail("laura@vdenergy.es");
        request.setPassword("SecurePassword123");
        request.setRole(Role.TECNICO);

        when(userRepository.findByEmail("laura@vdenergy.es")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("SecurePassword123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            return saved;
        });

        UserResponse response = userService.createUser(request, "performer-id", "127.0.0.1", "Mozilla");

        assertNotNull(response);
        assertEquals("laura@vdenergy.es", response.getEmail());
        assertEquals("Laura", response.getFirstName());
        assertEquals("Gomez", response.getLastName());
        assertEquals(Role.TECNICO, response.getRole());
        assertTrue(response.isActive());

        verify(auditService, times(1)).logEvent(
                eq("User"), any(), eq("USER_CREATED"), eq("USER"), eq("performer-id"), eq("127.0.0.1"), eq("Mozilla")
        );
    }

    @Test
    void createUserThrowsConflict() {
        UserCreateRequest request = new UserCreateRequest();
        request.setEmail("existing@vdenergy.es");

        User existing = new User("id", "Name", "Surname", "existing@vdenergy.es", "pwd", Role.TECNICO);
        when(userRepository.findByEmail("existing@vdenergy.es")).thenReturn(Optional.of(existing));

        assertThrows(ConflictException.class, () ->
                userService.createUser(request, "performer-id", "127.0.0.1", "Mozilla")
        );
        verify(userRepository, never()).save(any());
    }

    @Test
    void getUserByPublicIdThrowsNotFound() {
        when(userRepository.findByPublicId("non-existing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userService.getUserByPublicId("non-existing")
        );
    }
}
