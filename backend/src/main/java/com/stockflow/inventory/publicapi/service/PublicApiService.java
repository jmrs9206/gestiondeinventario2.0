package com.stockflow.inventory.publicapi.service;

import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.publicapi.entity.ApiClient;
import com.stockflow.inventory.publicapi.repository.ApiClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PublicApiService {

    private final ApiClientRepository apiClientRepository;
    private final AuditService auditService;

    public PublicApiService(ApiClientRepository apiClientRepository, AuditService auditService) {
        this.apiClientRepository = apiClientRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Optional<ApiClient> validateAndAuthenticateKey(String apiKey, String ip, String userAgent) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            auditService.logEvent(
                    "ApiClient",
                    "UNKNOWN",
                    "PUBLIC_API_DENIED",
                    "SYSTEM",
                    "NONE",
                    ip,
                    userAgent,
                    "API Key is missing or empty",
                    null
            );
            return Optional.empty();
        }

        String hash = hashApiKey(apiKey.trim());
        Optional<ApiClient> clientOpt = apiClientRepository.findByApiKeyHash(hash);

        if (clientOpt.isPresent()) {
            ApiClient client = clientOpt.get();
            if (!client.isActive()) {
                auditService.logEvent(
                        "ApiClient",
                        client.getPublicId(),
                        "PUBLIC_API_DENIED",
                        "SYSTEM",
                        client.getPublicId(),
                        ip,
                        userAgent,
                        "Client is inactive",
                        null
                );
                return Optional.empty();
            }

            client.setLastUsedAt(LocalDateTime.now());
            apiClientRepository.save(client);

            // Audit the successful public API access
            auditService.logEvent(
                    "ApiClient",
                    client.getPublicId(),
                    "PUBLIC_API_ACCESS",
                    "API_CLIENT",
                    client.getPublicId(),
                    ip,
                    userAgent
            );

            return Optional.of(client);
        }

        // Key not found in repository
        auditService.logEvent(
                "ApiClient",
                "UNKNOWN",
                "PUBLIC_API_DENIED",
                "SYSTEM",
                "NONE",
                ip,
                userAgent,
                "Invalid API Key",
                null
        );
        return Optional.empty();
    }

    public String hashApiKey(String apiKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(apiKey.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash API key", e);
        }
    }
}
