-- V2__seed_admin_user.sql
-- Seed default admin user for StockFlow Inventory Management System

INSERT IGNORE INTO users (public_id, first_name, last_name, email, password_hash, role, active)
VALUES ('3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', 'Admin', 'User', 'admin@tuempresa.com', '$2a$10$VtLdPAx6XifgNiJM5J4IcOQsT9mdSf2f/x4Pf.m4PiYZQsplKKQSy', 'ADMIN', 1);
