-- Migration 018: Add size column to OrderDetails table
-- This allows storing the selected size when user places an order

ALTER TABLE OrderDetails ADD COLUMN size VARCHAR(10) DEFAULT NULL;

SELECT 'Migration 018 completed: Added size column to OrderDetails' AS status;
