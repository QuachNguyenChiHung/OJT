-- Migration 002: Add COD (Cash on Delivery) support columns to customer_orders table

-- Add payment_method column if not exists
SET @dbname = DATABASE();
SET @tablename = 'customer_orders';

-- Check and add payment_method
SET @columnname = 'payment_method';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT "Column payment_method already exists"',
  'ALTER TABLE customer_orders ADD COLUMN payment_method ENUM("ONLINE", "COD") DEFAULT "ONLINE"'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add shipping_address
SET @columnname = 'shipping_address';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT "Column shipping_address already exists"',
  'ALTER TABLE customer_orders ADD COLUMN shipping_address VARCHAR(500)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add phone_number
SET @columnname = 'phone_number';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT "Column phone_number already exists"',
  'ALTER TABLE customer_orders ADD COLUMN phone_number VARCHAR(20)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add note
SET @columnname = 'note';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT "Column note already exists"',
  'ALTER TABLE customer_orders ADD COLUMN note TEXT'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing orders to have default payment method
UPDATE customer_orders SET payment_method = 'ONLINE' WHERE payment_method IS NULL;

-- Add index for payment_method
CREATE INDEX IF NOT EXISTS idx_payment_method ON customer_orders(payment_method);

SELECT 'Migration 002 completed: COD columns added to customer_orders' AS status;
