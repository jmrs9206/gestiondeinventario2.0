package com.vdenergy.inventory.publicapi.service;

import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.publicapi.entity.ApiClient;
import com.vdenergy.inventory.publicapi.repository.ApiClientRepository;
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
            return Optional.empty();
        }

        String hash = hashApiKey(apiKey.trim());
        Optional<ApiClient> clientOpt = apiClientRepository.findByApiKeyHashAndActiveTrue(hash);

        if (clientOpt.isPresent()) {
            ApiClient client = clientOpt.get();
            client.setLastUsedAt(LocalDateTime.now());
            apiClientRepository.save(client);

            // Audit the successful public API access
            auditService.logEvent(
                    "ApiClient",
                    client.getPublicId(),
                    "PUBLIC_API_ACCESS",
                    "SYSTEM",
                    client.getPublicId(),
                    ip,
                    userAgent
            );

            return Optional.of(client);
        }

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
