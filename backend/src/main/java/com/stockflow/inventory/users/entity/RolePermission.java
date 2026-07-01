package com.stockflow.inventory.users.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "role_permissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"role", "permission"})
})
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role", nullable = false, length = 80)
    private String role;

    @Column(name = "permission", nullable = false, length = 100)
    private String permission;

    public RolePermission() {
    }

    public RolePermission(String role, String permission) {
        this.role = role;
        this.permission = permission;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }
}
