package com.stockflow.inventory.auth.service;

import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.auth.dto.LoginResponse;
import com.stockflow.inventory.auth.entity.RefreshToken;
import com.stockflow.inventory.auth.repository.RefreshTokenRepository;
import com.stockflow.inventory.users.entity.Role;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginWithNonExistentUserThrowsBadCredentialsException() {
        when(userRepository.findByEmail("nonexistent@tuempresa.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () ->
            authService.login("nonexistent@tuempresa.com", "password", "127.0.0.1", "Agent")
        );

        verify(auditService).logEvent("User", "nonexistent@tuempresa.com", "LOGIN_FAILED", "SYSTEM", "NONE", "127.0.0.1", "Agent");
        verifyNoInteractions(jwtService, passwordEncoder, refreshTokenRepository);
    }

    @Test
    void loginWithInactiveUserThrowsBadCredentialsException() {
        User user = new User("uid", "First", "Last", "inactive@tuempresa.com", "hash", Role.TECNICO);
        user.setActive(false);

        when(userRepository.findByEmail("inactive@tuempresa.com")).thenReturn(Optional.of(user));

        assertThrows(BadCredentialsException.class, () ->
            authService.login("inactive@tuempresa.com", "password", "127.0.0.1", "Agent")
        );

        verify(auditService).logEvent("User", "uid", "LOGIN_FAILED", "USER", "uid", "127.0.0.1", "Agent");
        verifyNoInteractions(jwtService, passwordEncoder, refreshTokenRepository);
    }

    @Test
    void loginWithIncorrectPasswordThrowsBadCredentialsException() {
        User user = new User("uid", "First", "Last", "user@tuempresa.com", "hash", Role.TECNICO);
        user.setActive(true);

        when(userRepository.findByEmail("user@tuempresa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hash")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () ->
            authService.login("user@tuempresa.com", "wrongpassword", "127.0.0.1", "Agent")
        );

        verify(auditService).logEvent("User", "uid", "LOGIN_FAILED", "USER", "uid", "127.0.0.1", "Agent");
        verifyNoInteractions(jwtService, refreshTokenRepository);
    }

    @Test
    void loginSuccessfully() {
        User user = new User("uid", "First", "Last", "user@tuempresa.com", "hash", Role.TECNICO);
        user.setActive(true);

        when(userRepository.findByEmail("user@tuempresa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hash")).thenReturn(true);
        when(jwtService.generateToken("user@tuempresa.com", "uid", "TECNICO", true)).thenReturn("access_token_xyz");
        when(jwtService.getExpirationMs()).thenReturn(3600000L);

        LoginResponse response = authService.login("user@tuempresa.com", "password123", "127.0.0.1", "Agent");

        assertNotNull(response);
        assertEquals("access_token_xyz", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals(3600, response.getExpiresIn());

        verify(auditService).logEvent("User", "uid", "LOGIN_SUCCESS", "USER", "uid", "127.0.0.1", "Agent");
        verify(userRepository).save(user);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void loginWithLockedAccountThrowsLockedException() {
        User user = new User("uid", "First", "Last", "user@tuempresa.com", "hash", Role.TECNICO);
        user.setActive(true);
        user.setFailedLoginAttempts(5);
        user.setLockoutUntil(LocalDateTime.now().plusMinutes(15));

        when(userRepository.findByEmail("user@tuempresa.com")).thenReturn(Optional.of(user));

        assertThrows(org.springframework.security.authentication.LockedException.class, () ->
            authService.login("user@tuempresa.com", "password123", "127.0.0.1", "Agent")
        );

        verify(auditService).logEvent("User", "uid", "LOGIN_FAILED", "USER", "uid", "127.0.0.1", "Agent");
        verifyNoInteractions(passwordEncoder, refreshTokenRepository);
    }

    @Test
    void loginWithWrongPasswordIncrementsFailedAttempts() {
        User user = new User("uid", "First", "Last", "user@tuempresa.com", "hash", Role.TECNICO);
        user.setActive(true);
        user.setFailedLoginAttempts(2);

        when(userRepository.findByEmail("user@tuempresa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hash")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () ->
            authService.login("user@tuempresa.com", "wrongpassword", "127.0.0.1", "Agent")
        );

        assertEquals(3, user.getFailedLoginAttempts());
        assertNull(user.getLockoutUntil());
        verify(userRepository).save(user);
        verify(auditService).logEvent("User", "uid", "LOGIN_FAILED", "USER", "uid", "127.0.0.1", "Agent");
    }

    @Test
    void loginWithWrongPasswordFiveTimesLocksAccount() {
        User user = new User("uid", "First", "Last", "user@tuempresa.com", "hash", Role.TECNICO);
        user.setActive(true);
        user.setFailedLoginAttempts(4);

        when(userRepository.findByEmail("user@tuempresa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hash")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () ->
            authService.login("user@tuempresa.com", "wrongpassword", "127.0.0.1", "Agent")
        );

        assertEquals(5, user.getFailedLoginAttempts());
        assertNotNull(user.getLockoutUntil());
        verify(userRepository).save(user);
    }

    @Test
    void loginWithLockedAccountButExpiredLockoutPassivelyUnlocksAndSucceeds() {
        User user = new User("uid", "First", "Last", "user@tuempresa.com", "hash", Role.TECNICO);
        user.setActive(true);
        user.setFailedLoginAttempts(5);
        user.setLockoutUntil(LocalDateTime.now().minusMinutes(1)); // Expired

        when(userRepository.findByEmail("user@tuempresa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hash")).thenReturn(true);
        when(jwtService.generateToken("user@tuempresa.com", "uid", "TECNICO", true)).thenReturn("access_token_xyz");
        when(jwtService.getExpirationMs()).thenReturn(3600000L);

        LoginResponse response = authService.login("user@tuempresa.com", "password123", "127.0.0.1", "Agent");

        assertNotNull(response);
        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockoutUntil());
        verify(userRepository, times(1)).save(user); // Saved once at the end when login succeeds
    }
}
