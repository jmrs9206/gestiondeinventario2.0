package com.stockflow.inventory.users.repository;

import com.stockflow.inventory.users.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRole(String role);
    void deleteByRole(String role);
}
