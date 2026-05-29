package com.vdenergy.inventory.publicapi.repository;

import com.vdenergy.inventory.publicapi.entity.ApiClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApiClientRepository extends JpaRepository<ApiClient, Long> {
    Optional<ApiClient> findByApiKeyHashAndActiveTrue(String apiKeyHash);
}
