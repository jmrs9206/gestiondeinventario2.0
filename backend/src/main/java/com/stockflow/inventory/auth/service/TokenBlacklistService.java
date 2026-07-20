package com.stockflow.inventory.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(TokenBlacklistService.class);
    
    // Stores token hash / string -> expiration timestamp (ms)
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    /**
     * Add a JWT access token to the revocation blacklist.
     * 
     * @param token JWT token string
     * @param expirationTimeMs Epoch time in milliseconds when the token naturally expires
     */
    public void blacklistToken(String token, long expirationTimeMs) {
        if (token != null && !token.trim().isEmpty()) {
            blacklist.put(token, expirationTimeMs);
            log.info("JWT Access Token blacklisted successfully until timestamp {}", expirationTimeMs);
        }
    }

    /**
     * Check if a token is blacklisted.
     * 
     * @param token JWT token string
     * @return true if token is revoked
     */
    public boolean isBlacklisted(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        Long exp = blacklist.get(token);
        if (exp == null) {
            return false;
        }
        if (System.currentTimeMillis() > exp) {
            // Expired token can be removed
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    /**
     * Automatically purge expired tokens every hour to avoid memory growth.
     */
    @Scheduled(fixedRate = 3600000)
    public void purgeExpiredTokens() {
        long now = System.currentTimeMillis();
        int countBefore = blacklist.size();
        blacklist.entrySet().removeIf(entry -> now > entry.getValue());
        int removed = countBefore - blacklist.size();
        if (removed > 0) {
            log.info("Purged {} expired JWT tokens from revocation blacklist.", removed);
        }
    }
}
