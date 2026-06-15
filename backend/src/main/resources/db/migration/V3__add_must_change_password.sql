-- V3__add_must_change_password.sql
-- Add must_change_password field to enforce password rotation/security on first login.

ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE;
