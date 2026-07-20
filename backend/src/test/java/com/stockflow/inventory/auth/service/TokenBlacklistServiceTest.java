package com.stockflow.inventory.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenBlacklistServiceTest {

    private TokenBlacklistService tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistService();
    }

    @Test
    void testBlacklistTokenAndCheckIsBlacklisted() {
        String token = "sample-jwt-token-12345";
        long futureExp = System.currentTimeMillis() + 60000; // 1 min in future

        assertFalse(tokenBlacklistService.isBlacklisted(token));

        tokenBlacklistService.blacklistToken(token, futureExp);

        assertTrue(tokenBlacklistService.isBlacklisted(token));
    }

    @Test
    void testExpiredBlacklistedTokenReturnsFalse() {
        String token = "expired-token-999";
        long pastExp = System.currentTimeMillis() - 1000; // 1s in past

        tokenBlacklistService.blacklistToken(token, pastExp);

        // Expired token is no longer considered active blacklisted token
        assertFalse(tokenBlacklistService.isBlacklisted(token));
    }

    @Test
    void testNullOrEmptyTokenReturnsFalse() {
        assertFalse(tokenBlacklistService.isBlacklisted(null));
        assertFalse(tokenBlacklistService.isBlacklisted(""));
        assertFalse(tokenBlacklistService.isBlacklisted("   "));
    }
}
