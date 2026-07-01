-- V7__seed_mock_data.sql
-- Seed mock data for development and test demonstration (offices, materials, history, and technicians)
-- Normalization rule: All text data must be stored in UPPERCASE and WITHOUT ACCENTS/TILDES.

-- 1. Mock Technicians
INSERT IGNORE INTO users (public_id, first_name, last_name, email, password_hash, role, active, must_change_password, failed_login_attempts)
VALUES 
('f05d5483-e28a-4b07-94d1-137a1f59265f', 'CARLOS', 'RUIZ', 'tecnico1@tuempresa.com', '$2b$10$rqMYPhma/rGHeBzg/SQwCeZ7JUK2lH6PB.HUl5wSnC2VQvoANOnEu', 'TECNICO', 1, 0, 0),
('a2c3a5e8-5b12-4c28-944a-d68bc867a549', 'LAURA', 'GOMEZ', 'tecnico2@tuempresa.com', '$2b$10$rqMYPhma/rGHeBzg/SQwCeZ7JUK2lH6PB.HUl5wSnC2VQvoANOnEu', 'TECNICO', 1, 0, 0);

-- 2. Mock Offices (Sedes)
INSERT INTO offices (id, public_id, name, active) VALUES
(1, 'mock-office-madrid-id', 'MADRID', 1),
(2, 'mock-office-villalba-id', 'VILLALBA', 1),
(3, 'mock-office-medellin-id', 'MEDELLIN', 1),
(4, 'mock-office-salamanca-id', 'SALAMANCA', 1),
(5, 'mock-office-leon-id', 'LEON', 1);

-- 3. Mock Materials (Public codes must be random, secure and unpredictable without any predictable mat_ / MAT_ prefix)
-- Dell Monitor in Madrid
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (1, 'FSMWL5Y7YHKX6QRP2A7ALJYN', 'MONITOR', 'DELL', 'P2419H', 'MXL2419H001', 1, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- LG Monitor in Madrid
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (2, 'CQ2G332QXJ6174VP21PTLN9Q', 'MONITOR', 'LG', '27UK850', 'LG27UK850002', 1, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- HP Monitor in Villalba (in repair)
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (3, 'I4DK7BM3QTXM5L68KI7H2J2F', 'MONITOR', 'HP', 'ELITEDISPLAY E243', 'HP243ELITE003', 2, 'EN_REPARACION', CURRENT_TIMESTAMP, 1, 1);

-- Logitech Keyboard in Madrid
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (4, 'N5DSOFNKAUD1JIMUK62Z4YS1', 'TECLADO', 'LOGITECH', 'K120', 'LOGK120KEY004', 1, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- Corsair Keyboard in Villalba
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (5, 'WS34EGQ48G2HXJZV02KTHRZ1', 'TECLADO', 'CORSAIR', 'K55 RGB', 'CORK55RGB005', 2, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- Logitech Keyboard in Medellin (Broken)
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (6, 'U3T10KES83B80PNBRFCADTVL', 'TECLADO', 'LOGITECH', 'MX KEYS', 'LOGMXKEYS006', 3, 'ROTO', CURRENT_TIMESTAMP, 1, 1);

-- Logitech Mouse in Madrid
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (7, '4T20IIQWK9SWTBUQGGC6ZRQF', 'RATON', 'LOGITECH', 'M185', 'LOGM185MSE007', 1, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- Razer Mouse in Medellin
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (8, 'PALMAPS5612VF4NESPIY0AEC', 'RATON', 'RAZER', 'DEATHADDER ESSENTIAL', 'RZDEATHADD008', 3, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- Sennheiser Headphones in Madrid
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (9, 'Z2EY59FHOHV9VI4VJVUBXD8T', 'AUDIFONOS', 'SENNHEISER', 'HD 206', 'SENHD206HPH009', 1, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- Sony Headphones in Villalba
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (10, 'VJOI4BPKRWMVRLD3A2SZR1M2', 'AUDIFONOS', 'SONY', 'WH-1000XM4', 'SNY1000XM4010', 2, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- Lenovo Laptop in Madrid
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (11, '23VX0R7VIDXD3S8W17O8Q0ZV', 'LAPTOP', 'LENOVO', 'THINKPAD T14', 'LNVT14LAP011', 1, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- Apple Laptop in Villalba
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (12, 'RQVTG9NJ8I6RI455MJJPD67G', 'LAPTOP', 'APPLE', 'MACBOOK PRO 16', 'APLMBP16LAP012', 2, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- HP Laptop in Medellin (Baja)
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (13, 'TG9TOJMIWWL5U5267JZ8Z9NR', 'LAPTOP', 'HP', 'PROBOOK 440 G8', 'HPPRO440LAP013', 3, 'BAJA', CURRENT_TIMESTAMP, 1, 1);

-- Router in Salamanca
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (14, 'U0KHHMOOAQBW4F3M17JUADV9', 'ROUTER', 'MIKROTIK', 'RB4011', 'MKRB4011014', 4, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);

-- Switch in Leon
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_generated_at, qr_version, active)
VALUES (15, 'ZQ6D2JA5S4QH4DQ45ZXC4YME', 'SWITCH', 'CISCO', 'CATALYST 2960', 'CS2960SWT015', 5, 'OPERATIVO', CURRENT_TIMESTAMP, 1, 1);


-- 4. Mock Material History (Trazabilidad)
-- Initial registration actions
INSERT INTO material_history (material_id, action, previous_status, new_status, previous_office_id, new_office_id, comment, performed_by_user_id, created_at)
VALUES
(1, 'CREACION', NULL, 'OPERATIVO', NULL, 1, 'REGISTRO INICIAL DE MONITOR CORPORATIVO', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY)),
(2, 'CREACION', NULL, 'OPERATIVO', NULL, 1, 'REGISTRO INICIAL DE MONITOR DE DISENO', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY)),
(3, 'CREACION', NULL, 'OPERATIVO', NULL, 2, 'REGISTRO INICIAL DE MONITOR HP', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY)),
(4, 'CREACION', NULL, 'OPERATIVO', NULL, 1, 'REGISTRO INICIAL DE TECLADO DE SOPORTE', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY)),
(5, 'CREACION', NULL, 'OPERATIVO', NULL, 2, 'REGISTRO INICIAL DE TECLADO MECANICO', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY)),
(6, 'CREACION', NULL, 'OPERATIVO', NULL, 3, 'REGISTRO INICIAL DE TECLADO DE DESARROLLO', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY)),
(11, 'CREACION', NULL, 'OPERATIVO', NULL, 1, 'REGISTRO INICIAL DE LAPTOP CORPORATIVA', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY)),
(12, 'CREACION', NULL, 'OPERATIVO', NULL, 2, 'REGISTRO INICIAL DE LAPTOP DE DESARROLLO', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 9 DAY)),
(13, 'CREACION', NULL, 'OPERATIVO', NULL, 3, 'REGISTRO INICIAL DE LAPTOP HP', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY)),
(14, 'CREACION', NULL, 'OPERATIVO', NULL, 4, 'REGISTRO INICIAL DE ROUTER PRINCIPAL', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY)),
(15, 'CREACION', NULL, 'OPERATIVO', NULL, 5, 'REGISTRO INICIAL DE SWITCH DE BORDE', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 DAY));

-- History changes (Incidences & Transfers)
INSERT INTO material_history (material_id, action, previous_status, new_status, previous_office_id, new_office_id, comment, performed_by_user_id, created_at)
VALUES
(3, 'CAMBIO_ESTADO', 'OPERATIVO', 'EN_REPARACION', 2, 2, 'LA PANTALLA PARPADEA CONSTANTEMENTE. ENVIADA A TALLER.', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY)),
(6, 'CAMBIO_ESTADO', 'OPERATIVO', 'ROTO', 3, 3, 'SE DERRAMO CAFE SOBRE EL TECLADO. NO ENCIENDE.', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY)),
(13, 'CAMBIO_ESTADO', 'OPERATIVO', 'BAJA', 3, 3, 'EQUIPO OBSOLETO Y DANADO IRREVERSIBLEMENTE.', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 HOUR));
