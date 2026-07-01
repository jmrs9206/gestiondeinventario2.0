package com.stockflow.inventory.users.controller;

import com.stockflow.inventory.common.responses.ApiResponse;
import com.stockflow.inventory.users.entity.RolePermission;
import com.stockflow.inventory.users.repository.RolePermissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@RestController
@RequestMapping("/api/v1/roles")
@PreAuthorize("hasAuthority('MANAGE_ROLES')")
public class RoleController {

    private final RolePermissionRepository rolePermissionRepository;

    public RoleController(RolePermissionRepository rolePermissionRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getRolesAndPermissions() {
        List<RolePermission> allPermissions = rolePermissionRepository.findAll();
        Map<String, List<String>> roleMap = new HashMap<>();
        
        // Ensure both ADMIN and TECNICO keys exist in the map
        roleMap.put("ADMIN", new ArrayList<>());
        roleMap.put("TECNICO", new ArrayList<>());

        for (RolePermission rp : allPermissions) {
            roleMap.computeIfAbsent(rp.getRole(), k -> new ArrayList<>()).add(rp.getPermission());
        }

        return ResponseEntity.ok(new ApiResponse<>(roleMap));
    }

    @PutMapping("/{role}/permissions")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> updateRolePermissions(
            @PathVariable String role,
            @RequestBody List<String> permissions
    ) {
        String roleUpper = role.toUpperCase();
        if (!roleUpper.equals("ADMIN") && !roleUpper.equals("TECNICO")) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }

        // Delete existing permissions for the role
        rolePermissionRepository.deleteByRole(roleUpper);

        // Add new permissions
        List<RolePermission> newPermissions = new ArrayList<>();
        for (String permission : permissions) {
            newPermissions.add(new RolePermission(roleUpper, permission.toUpperCase()));
        }
        rolePermissionRepository.saveAll(newPermissions);

        // Return updated map of all roles
        List<RolePermission> allPermissions = rolePermissionRepository.findAll();
        Map<String, List<String>> roleMap = new HashMap<>();
        roleMap.put("ADMIN", new ArrayList<>());
        roleMap.put("TECNICO", new ArrayList<>());
        for (RolePermission rp : allPermissions) {
            roleMap.computeIfAbsent(rp.getRole(), k -> new ArrayList<>()).add(rp.getPermission());
        }

        return ResponseEntity.ok(new ApiResponse<>(roleMap));
    }
}
