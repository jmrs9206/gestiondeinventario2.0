-- V6__dynamic_roles_and_permissions.sql
-- Create role_permissions table to manage permissions dynamically

CREATE TABLE role_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(80) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_role_permission (role, permission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default permissions for ADMIN
INSERT INTO role_permissions (role, permission) VALUES
('ADMIN', 'CREATE_USER'),
('ADMIN', 'READ_USER'),
('ADMIN', 'UPDATE_USER'),
('ADMIN', 'CREATE_OFFICE'),
('ADMIN', 'UPDATE_OFFICE'),
('ADMIN', 'CREATE_MATERIAL'),
('ADMIN', 'UPDATE_MATERIAL'),
('ADMIN', 'UPDATE_MATERIAL_STATUS'),
('ADMIN', 'READ_DASHBOARD'),
('ADMIN', 'READ_AUDIT_LOG'),
('ADMIN', 'READ_MATERIAL_HISTORY'),
('ADMIN', 'MANAGE_API_CLIENTS'),
('ADMIN', 'REGENERATE_QR'),
('ADMIN', 'MANAGE_ROLES');

-- Seed default permissions for TECNICO
INSERT INTO role_permissions (role, permission) VALUES
('TECNICO', 'CREATE_OFFICE'),
('TECNICO', 'UPDATE_OFFICE'),
('TECNICO', 'CREATE_MATERIAL'),
('TECNICO', 'UPDATE_MATERIAL'),
('TECNICO', 'UPDATE_MATERIAL_STATUS'),
('TECNICO', 'READ_MATERIAL_HISTORY');
