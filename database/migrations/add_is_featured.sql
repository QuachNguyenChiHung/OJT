-- Migration: Add is_featured column to Product table
-- Run this SQL in your MySQL database

ALTER TABLE Product ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Update index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_featured ON Product(is_featured);

-- Verify
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Product' AND COLUMN_NAME = 'is_featured';
