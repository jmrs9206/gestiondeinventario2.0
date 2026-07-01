-- V5__add_invitation_token.sql
-- Add invitation token columns to users table

ALTER TABLE users ADD COLUMN invitation_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN invitation_token_expiry DATETIME DEFAULT NULL;
