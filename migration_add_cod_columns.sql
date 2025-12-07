-- Migration script to add COD order support columns to Orders table
-- Add payment_method, shipping_address, and phone columns

-- Add payment_method column
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[dbo].[Orders]')
               AND name = 'payment_method')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD payment_method NVARCHAR(50) NULL;

    PRINT 'Column payment_method added successfully';
END
ELSE
BEGIN
    PRINT 'Column payment_method already exists';
END
GO

-- Add shipping_address column
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[dbo].[Orders]')
               AND name = 'shipping_address')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD shipping_address NVARCHAR(500) NULL;

    PRINT 'Column shipping_address added successfully';
END
ELSE
BEGIN
    PRINT 'Column shipping_address already exists';
END
GO

-- Add phone column
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[dbo].[Orders]')
               AND name = 'phone')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD phone NVARCHAR(20) NULL;

    PRINT 'Column phone added successfully';
END
ELSE
BEGIN
    PRINT 'Column phone already exists';
END
GO

-- Update existing orders to have default payment method
UPDATE [dbo].[Orders]
SET payment_method = 'ONLINE'
WHERE payment_method IS NULL;

PRINT 'Migration completed successfully';
GO

-- Verify the changes
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Orders'
AND COLUMN_NAME IN ('payment_method', 'shipping_address', 'phone');
GO

