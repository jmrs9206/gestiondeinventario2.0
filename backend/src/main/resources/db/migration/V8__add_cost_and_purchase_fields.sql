-- V8__add_cost_and_purchase_fields.sql
-- Add purchase_price and purchase_date fields to materials table
ALTER TABLE materials ADD COLUMN purchase_price DECIMAL(15, 2) NULL DEFAULT NULL AFTER status;
ALTER TABLE materials ADD COLUMN purchase_date DATE NULL DEFAULT NULL AFTER purchase_price;
