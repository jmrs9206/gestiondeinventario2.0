-- V1__init_schema.sql
-- VDEnergy Inventory Management System Database Schema Initialization

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(64) UNIQUE NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TECNICO') NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Offices Table
CREATE TABLE offices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(160) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Materials Table
CREATE TABLE materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_code VARCHAR(80) UNIQUE NOT NULL,
    material_type VARCHAR(80) NOT NULL,
    brand VARCHAR(120),
    model VARCHAR(120),
    serial_number VARCHAR(160),
    office_id BIGINT NOT NULL,
    status ENUM('OPERATIVO', 'ROTO', 'EN_REPARACION', 'BAJA') NOT NULL,
    qr_generated_at TIMESTAMP NULL DEFAULT NULL,
    qr_version INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_materials_office FOREIGN KEY (office_id) REFERENCES offices (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Material History Table
CREATE TABLE material_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_id BIGINT NOT NULL,
    action VARCHAR(80) NOT NULL,
    previous_status VARCHAR(40),
    new_status VARCHAR(40),
    previous_office_id BIGINT,
    new_office_id BIGINT,
    comment TEXT,
    performed_by_user_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_material FOREIGN KEY (material_id) REFERENCES materials(id),
    CONSTRAINT fk_history_user FOREIGN KEY (performed_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Audit Log Table
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(120),
    action VARCHAR(120) NOT NULL,
    old_value JSON,
    new_value JSON,
    performed_by_type VARCHAR(40) NOT NULL,
    performed_by_id VARCHAR(120),
    ip_address VARCHAR(80),
    user_agent VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. API Clients Table
CREATE TABLE api_clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(180) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. API Client Scopes Table
CREATE TABLE api_client_scopes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_client_id BIGINT NOT NULL,
    scope VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scopes_client FOREIGN KEY (api_client_id) REFERENCES api_clients(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Mandatory Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_public_id ON users(public_id);
CREATE INDEX idx_offices_public_id ON offices(public_id);
CREATE INDEX idx_materials_public_code ON materials(public_code);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_office_id ON materials(office_id);
CREATE INDEX idx_materials_active ON materials(active);
CREATE INDEX idx_material_history_material_id ON material_history(material_id);
CREATE INDEX idx_material_history_created_at ON material_history(created_at);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_api_clients_public_id ON api_clients(public_id);
CREATE INDEX idx_api_client_scopes_api_client_id ON api_client_scopes(api_client_id);
