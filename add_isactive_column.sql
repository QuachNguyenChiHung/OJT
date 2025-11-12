-- Add isActive column to Product table
-- This script adds the is_active column to control product visibility

-- Add is_active column to Product table with default value true
ALTER TABLE Product
ADD is_active BIT NOT NULL DEFAULT 1;

-- Update existing products to be active by default
UPDATE Product
SET is_active = 1
WHERE is_active IS NULL;

-- Optional: Add index for better query performance
CREATE INDEX idx_product_isactive ON Product(is_active);

-- Display confirmation
SELECT 'Column is_active added to Product table successfully' AS Status;

