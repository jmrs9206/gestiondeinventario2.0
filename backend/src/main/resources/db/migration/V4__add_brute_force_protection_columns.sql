-- Migration to add brute force protection columns to users table
ALTER TABLE users 
ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0,
ADD COLUMN lockout_until TIMESTAMP NULL DEFAULT NULL;
