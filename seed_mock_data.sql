-- SQL script to seed mock data in Gestión De Inventario database
-- This populates offices, users, materials, history, and audit logs for demonstration.

-- Clean up existing mock data (except system admin user)
DELETE FROM audit_log;
DELETE FROM material_history;
DELETE FROM materials;
DELETE FROM offices;
DELETE FROM users WHERE id > 1;

-- Reset auto-increment columns
ALTER TABLE offices AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 2;
ALTER TABLE materials AUTO_INCREMENT = 1;
ALTER TABLE material_history AUTO_INCREMENT = 1;
ALTER TABLE audit_log AUTO_INCREMENT = 1;

-- 1. Insert Offices
INSERT INTO offices (id, public_id, name, active) VALUES
(1, 'off_madrid_001', 'SEDE CENTRAL MADRID', 1),
(2, 'off_barcelona_002', 'SEDE BARCELONA NORTE', 1),
(3, 'off_sevilla_003', 'DEPARTAMENTO LOGISTICA SEVILLA', 1),
(4, 'off_valencia_004', 'OFICINA VALENCIA SUR', 0);

-- 2. Insert Users (Technicians and secondary Admins)
-- Password for all mock technicians/admins is "tecnico123"
INSERT INTO users (id, public_id, first_name, last_name, email, password_hash, role, active, must_change_password) VALUES
(2, 'usr_tecnico_001', 'Carlos', 'García', 'tecnico1@tuempresa.com', '$2b$12$S7qon/7umyt/lP6AGKDwTOoqGiwiORj391/UbVFN339andh7lqRPy', 'TECNICO', 1, 0),
(3, 'usr_tecnico_002', 'Laura', 'Martín', 'tecnico2@tuempresa.com', '$2b$12$S7qon/7umyt/lP6AGKDwTOoqGiwiORj391/UbVFN339andh7lqRPy', 'TECNICO', 1, 0),
(4, 'usr_admin_002', 'Ana', 'Sánchez', 'admin2@tuempresa.com', '$2b$12$S7qon/7umyt/lP6AGKDwTOoqGiwiORj391/UbVFN339andh7lqRPy', 'ADMIN', 1, 0);

-- 3. Insert Materials
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active) VALUES
(1, 'mat_laptop_001', 'PORTATIL', 'DELL', 'LATITUDE 5420', 'SN-DELL-998822', 1, 'OPERATIVO', NOW(), 1, 1),
(2, 'mat_laptop_002', 'PORTATIL', 'HP', 'PROBOOK 450', 'SN-HP-334455', 2, 'EN_REPARACION', NOW(), 1, 1),
(3, 'mat_router_001', 'ROUTER', 'CISCO', 'ISR 4331', 'SN-CISCO-881133', 1, 'OPERATIVO', NOW(), 1, 1),
(4, 'mat_switch_001', 'SWITCH', 'MIKROTIK', 'CRS326-24G', 'SN-MIKRO-556677', 1, 'OPERATIVO', NOW(), 1, 1),
(5, 'mat_ap_001', 'ACCESS POINT', 'UBIQUITI', 'UAP-AC-PRO', 'SN-UBIQ-112233', 2, 'ROTO', NOW(), 1, 1),
(6, 'mat_screen_001', 'PANTALLA', 'LG', '27UL500-W', 'SN-LG-445566', 3, 'OPERATIVO', NOW(), 1, 1),
(7, 'mat_printer_001', 'IMPRESORA', 'HP', 'LASERJET PRO', 'SN-HP-990011', 3, 'OPERATIVO', NOW(), 1, 1),
(8, 'mat_ap_002', 'ACCESS POINT', 'UBIQUITI', 'UAP-AC-LITE', 'SN-UBIQ-445566', 1, 'BAJA', NOW(), 1, 1);

-- 4. Insert Material History (Movements)
INSERT INTO material_history (id, material_id, action, previous_status, new_status, previous_office_id, new_office_id, comment, performed_by_user_id, created_at) VALUES
-- Laptop 001
(1, 1, 'REGISTRO', NULL, 'OPERATIVO', NULL, 1, 'Registro inicial del equipo en Sede Central Madrid.', 1, '2026-05-22 09:00:00'),
-- Laptop 002
(2, 2, 'REGISTRO', NULL, 'OPERATIVO', NULL, 2, 'Registro inicial en Sede Barcelona.', 1, '2026-05-23 10:00:00'),
(3, 2, 'CAMBIO_ESTADO', 'OPERATIVO', 'EN_REPARACION', 2, 2, 'Fallo en disco duro, se envía a soporte técnico.', 2, '2026-06-01 14:30:00'),
-- Router 001
(4, 3, 'REGISTRO', NULL, 'OPERATIVO', NULL, 1, 'Router de core para la sede central.', 1, '2026-05-24 08:45:00'),
-- Switch 001
(5, 4, 'REGISTRO', NULL, 'OPERATIVO', NULL, 1, 'Switch de distribución.', 2, '2026-05-25 11:20:00'),
-- AP 001
(6, 5, 'REGISTRO', NULL, 'OPERATIVO', NULL, 2, 'Punto de acceso planta 1.', 3, '2026-05-26 15:10:00'),
(7, 5, 'CAMBIO_ESTADO', 'OPERATIVO', 'ROTO', 2, 2, 'Daño por sobretensión en tormenta eléctrica.', 3, '2026-06-10 18:22:00'),
-- Screen 001
(8, 6, 'REGISTRO', NULL, 'OPERATIVO', NULL, 3, 'Pantalla 27 pulgadas.', 2, '2026-05-27 10:05:00'),
-- Printer 001
(9, 7, 'REGISTRO', NULL, 'OPERATIVO', NULL, 3, 'Impresora de red departamento administración.', 1, '2026-05-28 09:30:00'),
-- AP 002
(10, 8, 'REGISTRO', NULL, 'OPERATIVO', NULL, 1, 'AP provisional.', 2, '2026-05-22 10:00:00'),
(11, 8, 'BAJA', 'OPERATIVO', 'BAJA', 1, 1, 'Dado de baja por obsolescencia tecnológica.', 1, '2026-06-12 12:00:00');

-- 5. Insert Audit Logs
INSERT INTO audit_log (id, entity_type, entity_id, action, performed_by_type, performed_by_id, ip_address, user_agent, created_at) VALUES
(1, 'Office', 'off_madrid_001', 'OFFICE_CREATED', 'USER', '3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', '127.0.0.1', 'Mozilla/5.0', '2026-05-22 08:30:00'),
(2, 'User', 'usr_tecnico_001', 'USER_CREATED', 'USER', '3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', '127.0.0.1', 'Mozilla/5.0', '2026-05-22 08:45:00'),
(3, 'Material', 'mat_laptop_001', 'MATERIAL_CREATED', 'USER', '3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', '127.0.0.1', 'Mozilla/5.0', '2026-05-22 09:00:00'),
(4, 'Material', 'mat_laptop_002', 'MATERIAL_STATUS_CHANGED', 'USER', 'usr_tecnico_001', '127.0.0.1', 'Mozilla/5.0', '2026-06-01 14:30:00'),
(5, 'Material', 'mat_ap_002', 'MATERIAL_DECOMMISSIONED', 'USER', '3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', '127.0.0.1', 'Mozilla/5.0', '2026-06-12 12:00:00');
