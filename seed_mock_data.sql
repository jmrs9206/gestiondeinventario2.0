-- SQL script to seed mock data in Gestión De Inventario database
-- Normalization rule: All text data must be stored in UPPERCASE and WITHOUT ACCENTS/TILDES.
-- Preserves exactly these five offices: MADRID, VILLALBA, MEDELLIN, SALAMANCA, LEON

DELETE FROM audit_log;
DELETE FROM material_history;
DELETE FROM refresh_tokens;
DELETE FROM materials;
DELETE FROM offices;
DELETE FROM users WHERE email IN ('tecnico1@tuempresa.com', 'tecnico2@tuempresa.com');

ALTER TABLE offices AUTO_INCREMENT = 1;
ALTER TABLE materials AUTO_INCREMENT = 1;
ALTER TABLE material_history AUTO_INCREMENT = 1;
ALTER TABLE audit_log AUTO_INCREMENT = 1;

INSERT INTO users (public_id, first_name, last_name, email, password_hash, role, active, must_change_password)
SELECT
  '3a9f0e22-83b1-4c6e-8d8a-9f5b2e3e1c6f',
  'ADMIN',
  'USER',
  'admin@tuempresa.com',
  '$2b$12$V2NjaESkrzlWSW8xtlzm6.d9M7btr.3lEKqN2zEYWq7lDxE9CC3ay',
  'ADMIN',
  1,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@tuempresa.com'
);

-- 1. Insert Offices
INSERT INTO offices (id, public_id, name, active) VALUES
(1, 'mock-office-madrid-id', 'MADRID', 1),
(2, 'mock-office-villalba-id', 'VILLALBA', 1),
(3, 'mock-office-medellin-id', 'MEDELLIN', 1),
(4, 'mock-office-salamanca-id', 'SALAMANCA', 1),
(5, 'mock-office-leon-id', 'LEON', 1);

-- 2. Insert Users (Password is 'tecnico123')
INSERT INTO users (id, public_id, first_name, last_name, email, password_hash, role, active, must_change_password) VALUES
(2, 'USR_TECNICO_001', 'CARLOS', 'RUIZ', 'tecnico1@tuempresa.com', '$2b$10$rqMYPhma/rGHeBzg/SQwCeZ7JUK2lH6PB.HUl5wSnC2VQvoANOnEu', 'TECNICO', 1, 0),
(3, 'USR_TECNICO_002', 'LAURA', 'GOMEZ', 'tecnico2@tuempresa.com', '$2b$10$rqMYPhma/rGHeBzg/SQwCeZ7JUK2lH6PB.HUl5wSnC2VQvoANOnEu', 'TECNICO', 1, 0);

-- 3. Insert Materials
INSERT INTO materials (id, public_code, material_type, brand, model, serial_number, office_id, status, qr_version, active, created_at, updated_at) VALUES
(1, 'FSMWL5Y7YHKX6QRP2A7ALJYN', 'MONITOR', 'DELL', 'P2419H', 'MXL2419H001', 1, 'OPERATIVO', 1, 1, NOW(), NOW()),
(2, 'CQ2G332QXJ6174VP21PTLN9Q', 'MONITOR', 'LG', '27UK850', 'LG27UK850002', 1, 'OPERATIVO', 1, 1, NOW(), NOW()),
(3, 'I4DK7BM3QTXM5L68KI7H2J2F', 'MONITOR', 'HP', 'ELITEDISPLAY E243', 'HP243ELITE003', 2, 'EN_REPARACION', 1, 1, NOW(), NOW()),
(4, 'N5DSOFNKAUD1JIMUK62Z4YS1', 'TECLADO', 'LOGITECH', 'K120', 'LOGK120KEY004', 1, 'OPERATIVO', 1, 1, NOW(), NOW()),
(5, 'WS34EGQ48G2HXJZV02KTHRZ1', 'TECLADO', 'CORSAIR', 'K55 RGB', 'CORK55RGB005', 2, 'OPERATIVO', 1, 1, NOW(), NOW()),
(6, 'U3T10KES83B80PNBRFCADTVL', 'TECLADO', 'LOGITECH', 'MX KEYS', 'LOGMXKEYS006', 3, 'ROTO', 1, 1, NOW(), NOW()),
(7, '4T20IIQWK9SWTBUQGGC6ZRQF', 'RATON', 'LOGITECH', 'M185', 'LOGM185MSE007', 1, 'OPERATIVO', 1, 1, NOW(), NOW()),
(8, 'PALMAPS5612VF4NESPIY0AEC', 'RATON', 'RAZER', 'DEATHADDER ESSENTIAL', 'RZDEATHADD008', 3, 'OPERATIVO', 1, 1, NOW(), NOW()),
(9, 'Z2EY59FHOHV9VI4VJVUBXD8T', 'AUDIFONOS', 'SENNHEISER', 'HD 206', 'SENHD206HPH009', 1, 'OPERATIVO', 1, 1, NOW(), NOW()),
(10, 'VJOI4BPKRWMVRLD3A2SZR1M2', 'AUDIFONOS', 'SONY', 'WH-1000XM4', 'SNY1000XM4010', 2, 'OPERATIVO', 1, 1, NOW(), NOW()),
(11, '23VX0R7VIDXD3S8W17O8Q0ZV', 'LAPTOP', 'LENOVO', 'THINKPAD T14', 'LNVT14LAP011', 1, 'OPERATIVO', 1, 1, NOW(), NOW()),
(12, 'RQVTG9NJ8I6RI455MJJPD67G', 'LAPTOP', 'APPLE', 'MACBOOK PRO 16', 'APLMBP16LAP012', 2, 'OPERATIVO', 1, 1, NOW(), NOW()),
(13, 'TG9TOJMIWWL5U5267JZ8Z9NR', 'LAPTOP', 'HP', 'PROBOOK 440 G8', 'HPPRO440LAP013', 3, 'BAJA', 1, 1, NOW(), NOW()),
(14, 'U0KHHMOOAQBW4F3M17JUADV9', 'ROUTER', 'MIKROTIK', 'RB4011', 'MKRB4011014', 4, 'OPERATIVO', 1, 1, NOW(), NOW()),
(15, 'ZQ6D2JA5S4QH4DQ45ZXC4YME', 'SWITCH', 'CISCO', 'CATALYST 2960', 'CS2960SWT015', 5, 'OPERATIVO', 1, 1, NOW(), NOW());

-- 4. Insert Material History
INSERT INTO material_history (id, material_id, action, previous_status, new_status, new_office_id, comment, performed_by_user_id, created_at) VALUES
(1, 1, 'CREACION', NULL, 'OPERATIVO', 1, 'REGISTRO INICIAL DE MONITOR CORPORATIVO', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), NOW()),
(2, 2, 'CREACION', NULL, 'OPERATIVO', 1, 'REGISTRO INICIAL DE MONITOR DE DISENO', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), NOW()),
(3, 3, 'CREACION', NULL, 'OPERATIVO', 2, 'REGISTRO INICIAL DE MONITOR HP', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), NOW()),
(4, 4, 'CREACION', NULL, 'OPERATIVO', 1, 'REGISTRO INICIAL DE TECLADO DE SOPORTE', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), NOW()),
(5, 5, 'CREACION', NULL, 'OPERATIVO', 2, 'REGISTRO INICIAL DE TECLADO MECANICO', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), NOW()),
(6, 6, 'CREACION', NULL, 'OPERATIVO', 3, 'REGISTRO INICIAL DE TECLADO DE DESARROLLO', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), NOW()),
(7, 11, 'CREACION', NULL, 'OPERATIVO', 1, 'REGISTRO INICIAL DE LAPTOP CORPORATIVA', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), NOW()),
(8, 12, 'CREACION', NULL, 'OPERATIVO', 2, 'REGISTRO INICIAL DE LAPTOP DE DESARROLLO', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), NOW()),
(9, 13, 'CREACION', NULL, 'OPERATIVO', 3, 'REGISTRO INICIAL DE LAPTOP HP', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), NOW()),
(10, 14, 'CREACION', NULL, 'OPERATIVO', 4, 'REGISTRO INICIAL DE ROUTER PRINCIPAL', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), NOW()),
(11, 15, 'CREACION', NULL, 'OPERATIVO', 5, 'REGISTRO INICIAL DE SWITCH DE BORDE', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), NOW()),
(12, 3, 'CAMBIO_ESTADO', 'OPERATIVO', 'EN_REPARACION', 2, 'LA PANTALLA PARPADEA CONSTANTEMENTE. ENVIADA A TALLER.', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), NOW()),
(13, 6, 'CAMBIO_ESTADO', 'OPERATIVO', 'ROTO', 3, 'SE DERRAMO CAFE SOBRE EL TECLADO. NO ENCIENDE.', (SELECT id FROM users WHERE email = 'tecnico1@tuempresa.com'), NOW()),
(14, 13, 'CAMBIO_ESTADO', 'OPERATIVO', 'BAJA', 3, 'EQUIPO OBSOLETO Y DANADO IRREVERSIBLEMENTE.', (SELECT id FROM users WHERE email = 'admin@tuempresa.com'), NOW());
