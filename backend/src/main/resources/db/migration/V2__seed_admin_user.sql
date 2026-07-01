-- V2__seed_admin_user.sql
-- Seed default admin user for StockFlow Inventory Management System

INSERT IGNORE INTO users (public_id, first_name, last_name, email, password_hash, role, active)
VALUES ('3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', 'ADMIN', 'USER', 'admin@tuempresa.com', '$2b$12$V2NjaESkrzlWSW8xtlzm6.d9M7btr.3lEKqN2zEYWq7lDxE9CC3ay', 'ADMIN', 1);
