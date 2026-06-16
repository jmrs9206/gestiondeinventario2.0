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
(1, 'off_madrid_001', 'MADRID', 1),
(2, 'off_medellin_002', 'MEDELLIN', 1),
(3, 'off_salamanca_003', 'SALAMANCA', 1),
(4, 'off_villalba_004', 'VILLALBA', 1),
(5, 'off_canarias_005', 'CANARIAS', 1),
(6, 'off_valencia_006', 'VALENCIA', 1);

-- 2. Insert Users (Technicians and secondary Admins)
-- Password for all mock technicians/admins is "tecnico123"
INSERT INTO users (id, public_id, first_name, last_name, email, password_hash, role, active, must_change_password) VALUES
(2, 'usr_tecnico_001', 'Carlos', 'García', 'tecnico1@tuempresa.com', '$2b$12$S7qon/7umyt/lP6AGKDwTOoqGiwiORj391/UbVFN339andh7lqRPy', 'TECNICO', 1, 0),
(3, 'usr_tecnico_002', 'Laura', 'Martín', 'tecnico2@tuempresa.com', '$2b$12$S7qon/7umyt/lP6AGKDwTOoqGiwiORj391/UbVFN339andh7lqRPy', 'TECNICO', 1, 0);

-- 3. Insert Materials
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active) VALUES
(1, 'mat_mjmMqa2WSeCPqTzI9MMG', 'MONITOR', 'LG', '27UL500-W', 'SN-LG-998822', 1, 'OPERATIVO', NOW(), 1, 1),
(2, 'mat_wh8DxEA6je2efSgsDhdk', 'AUDIFONOS', 'SONY', 'WH-1000XM4', 'SN-SONY-334455', 2, 'OPERATIVO', NOW(), 1, 1),
(3, 'mat_pkvPBH37D2EIT02tTTtI', 'TECLADO', 'LOGITECH', 'MX KEYS', 'SN-LOGI-881133', 3, 'OPERATIVO', NOW(), 1, 1),
(4, 'mat_nLg0Ry77oqxM0PeZwzey', 'RATON', 'LOGITECH', 'MX MASTER 3', 'SN-LOGI-556677', 4, 'OPERATIVO', NOW(), 1, 1),
(5, 'mat_wi6tTujpaJIC5cHupjmA', 'MONITOR', 'DELL', 'U2419H', 'SN-DELL-112233', 5, 'EN_REPARACION', NOW(), 1, 1),
(6, 'mat_ZxugYHXyUUTFc6uibtXb', 'TECLADO', 'CORSAIR', 'K70 RGB', 'SN-CORS-445566', 6, 'ROTO', NOW(), 1, 1),
(7, 'mat_Ic7smKf93Lu6wFFrUXNA', 'RATON', 'RAZER', 'DEATHADDER', 'SN-RAZE-990011', 1, 'OPERATIVO', NOW(), 1, 1),
(8, 'mat_9ofMM4lq8Iz0An8BOdgC', 'AUDIFONOS', 'BOSE', 'QUIETCOMFORT 45', 'SN-BOSE-445566', 2, 'BAJA', NOW(), 1, 1),
-- Madrid Office (Office 1): We need M=3, T=2, R=2, A=3 (ID 1 is MONITOR, ID 7 is RATON)
-- Adding: 2 Monitors, 2 Keyboards, 1 Mouse, 3 Headphones
(9, 'mat_madrid_monitor_002', 'MONITOR', 'LG', '27UL500-W', 'SN-LG-998823', 1, 'OPERATIVO', NOW(), 1, 1),
(10, 'mat_madrid_monitor_003', 'MONITOR', 'LG', '27UL500-W', 'SN-LG-998824', 1, 'OPERATIVO', NOW(), 1, 1),
(11, 'mat_madrid_teclado_001', 'TECLADO', 'LOGITECH', 'MX KEYS', 'SN-LOGI-881134', 1, 'OPERATIVO', NOW(), 1, 1),
(12, 'mat_madrid_teclado_002', 'TECLADO', 'LOGITECH', 'MX KEYS', 'SN-LOGI-881135', 1, 'OPERATIVO', NOW(), 1, 1),
(13, 'mat_madrid_raton_002', 'RATON', 'LOGITECH', 'MX MASTER 3', 'SN-LOGI-556678', 1, 'OPERATIVO', NOW(), 1, 1),
(14, 'mat_madrid_audifonos_001', 'AUDIFONOS', 'SONY', 'WH-1000XM4', 'SN-SONY-334456', 1, 'OPERATIVO', NOW(), 1, 1),
(15, 'mat_madrid_audifonos_002', 'AUDIFONOS', 'SONY', 'WH-1000XM4', 'SN-SONY-334457', 1, 'OPERATIVO', NOW(), 1, 1),
(16, 'mat_madrid_audifonos_003', 'AUDIFONOS', 'SONY', 'WH-1000XM4', 'SN-SONY-334458', 1, 'OPERATIVO', NOW(), 1, 1),
-- Medellin Office (Office 2): We need M=3, T=2, R=2, A=2 (ID 2 is AUDIFONOS)
-- Adding: 3 Monitors, 2 Keyboards, 2 Mice, 1 Headphone
(17, 'mat_medellin_monitor_001', 'MONITOR', 'DELL', 'U2419H', 'SN-DELL-112234', 2, 'OPERATIVO', NOW(), 1, 1),
(18, 'mat_medellin_monitor_002', 'MONITOR', 'DELL', 'U2419H', 'SN-DELL-112235', 2, 'OPERATIVO', NOW(), 1, 1),
(19, 'mat_medellin_monitor_003', 'MONITOR', 'DELL', 'U2419H', 'SN-DELL-112236', 2, 'OPERATIVO', NOW(), 1, 1),
(20, 'mat_medellin_teclado_001', 'TECLADO', 'CORSAIR', 'K70 RGB', 'SN-CORS-445567', 2, 'OPERATIVO', NOW(), 1, 1),
(21, 'mat_medellin_teclado_002', 'TECLADO', 'CORSAIR', 'K70 RGB', 'SN-CORS-445568', 2, 'OPERATIVO', NOW(), 1, 1),
(22, 'mat_medellin_raton_001', 'RATON', 'RAZER', 'DEATHADDER', 'SN-RAZE-990012', 2, 'OPERATIVO', NOW(), 1, 1),
(23, 'mat_medellin_raton_002', 'RATON', 'RAZER', 'DEATHADDER', 'SN-RAZE-990013', 2, 'OPERATIVO', NOW(), 1, 1),
(24, 'mat_medellin_audifonos_002', 'AUDIFONOS', 'SONY', 'WH-1000XM4', 'SN-SONY-334460', 2, 'OPERATIVO', NOW(), 1, 1);

-- 4. Insert Material History (Movements)
INSERT INTO material_history (id, material_id, action, previous_status, new_status, previous_office_id, new_office_id, comment, performed_by_user_id, created_at) VALUES
-- Monitor 001
(1, 1, 'REGISTRO', NULL, 'OPERATIVO', NULL, 1, 'Registro inicial del monitor LG en la oficina de Madrid.', 1, '2026-05-22 09:00:00'),
-- Audifonos 001
(2, 2, 'REGISTRO', NULL, 'OPERATIVO', NULL, 2, 'Registro inicial de audífonos Sony en Medellín.', 1, '2026-05-23 10:00:00'),
-- Teclado 001
(3, 3, 'REGISTRO', NULL, 'OPERATIVO', NULL, 3, 'Registro inicial de teclado Logitech en Salamanca.', 2, '2026-05-24 08:45:00'),
-- Raton 001
(4, 4, 'REGISTRO', NULL, 'OPERATIVO', NULL, 4, 'Registro inicial de ratón Logitech en Villalba.', 2, '2026-05-25 11:20:00'),
-- Monitor 002
(5, 5, 'REGISTRO', NULL, 'OPERATIVO', NULL, 5, 'Registro inicial de monitor Dell en Canarias.', 3, '2026-05-26 15:10:00'),
(6, 5, 'CAMBIO_ESTADO', 'OPERATIVO', 'EN_REPARACION', 5, 5, 'Falla de retroiluminación en el panel IPS.', 3, '2026-06-01 12:00:00'),
-- Teclado 002
(7, 6, 'REGISTRO', NULL, 'OPERATIVO', NULL, 6, 'Teclado Corsair registrado en Valencia.', 2, '2026-05-27 10:05:00'),
(8, 6, 'CAMBIO_ESTADO', 'OPERATIVO', 'ROTO', 6, 6, 'Daño físico por derrame de líquidos.', 2, '2026-06-08 14:15:00'),
-- Raton 002
(9, 7, 'REGISTRO', NULL, 'OPERATIVO', NULL, 1, 'Ratón Razer registrado en Madrid.', 1, '2026-05-28 09:30:00'),
(10, 8, 'REGISTRO', NULL, 'OPERATIVO', NULL, 2, 'Audífonos Bose registrados en Medellín.', 2, '2026-05-22 10:00:00'),
(11, 8, 'BAJA', 'OPERATIVO', 'BAJA', 2, 2, 'Desgaste irreparable de almohadillas y diadema.', 1, '2026-06-12 12:00:00'),
-- Monitor 001 - completed repair cycle example (52 hours duration)
(12, 1, 'CAMBIO_ESTADO', 'OPERATIVO', 'EN_REPARACION', 1, 1, 'Fallo en puerto HDMI, se envía a servicio técnico oficial.', 2, '2026-06-03 10:00:00'),
(13, 1, 'CAMBIO_ESTADO', 'EN_REPARACION', 'OPERATIVO', 1, 1, 'Puerto HDMI reemplazado y testeado correctamente.', 2, '2026-06-05 14:00:00');

-- 5. Insert Audit Logs
INSERT INTO audit_log (id, entity_type, entity_id, action, performed_by_type, performed_by_id, ip_address, user_agent, created_at) VALUES
(1, 'Office', 'off_madrid_001', 'OFFICE_CREATED', 'USER', '3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', '127.0.0.1', 'Mozilla/5.0', '2026-05-22 08:30:00'),
(2, 'Material', 'mat_mjmMqa2WSeCPqTzI9MMG', 'MATERIAL_CREATED', 'USER', '3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', '127.0.0.1', 'Mozilla/5.0', '2026-05-22 09:00:00'),
(3, 'Material', 'mat_wi6tTujpaJIC5cHupjmA', 'MATERIAL_STATUS_CHANGED', 'USER', 'usr_tecnico_001', '127.0.0.1', 'Mozilla/5.0', '2026-06-01 12:00:00'),
(4, 'Material', 'mat_ZxugYHXyUUTFc6uibtXb', 'MATERIAL_STATUS_CHANGED', 'USER', 'usr_tecnico_001', '127.0.0.1', 'Mozilla/5.0', '2026-06-08 14:15:00'),
(5, 'Material', 'mat_9ofMM4lq8Iz0An8BOdgC', 'MATERIAL_DECOMMISSIONED', 'USER', '3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f', '127.0.0.1', 'Mozilla/5.0', '2026-06-12 12:00:00');
