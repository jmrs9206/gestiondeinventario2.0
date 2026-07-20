-- V9__update_admin_email.sql
-- Update default admin email address
UPDATE users SET email = 'admin@juliodriguez.dev' WHERE email = 'admin@tuempresa.com';
