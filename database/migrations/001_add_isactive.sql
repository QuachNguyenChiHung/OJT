-- Migration 001: Add is_active column to products table
-- Run this if upgrading from older schema

-- Check if column exists before adding
SET @dbname = DATABASE();
SET @tablename = 'products';
SET @columnname = 'is_active';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT "Column is_active already exists"',
  'ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Update existing products to be active
UPDATE products SET is_active = TRUE WHERE is_active IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_isactive ON products(is_active);

SELECT 'Migration 001 completed: is_active column added to products' AS status;
