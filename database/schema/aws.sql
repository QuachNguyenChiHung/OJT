-- Drop all tables in correct order (dependents first)
DROP TABLE IF EXISTS [Cart];
DROP TABLE IF EXISTS [OrderDetails];
DROP TABLE IF EXISTS [Orders];
DROP TABLE IF EXISTS [Rating];
DROP TABLE IF EXISTS [ProductDetails];
DROP TABLE IF EXISTS [Banner];
DROP TABLE IF EXISTS [Product];
DROP TABLE IF EXISTS [Category];
DROP TABLE IF EXISTS [Brand];
DROP TABLE IF EXISTS [Users];

-- =====================================================
-- Users Table
-- Extends: Auditable (createdAt, updatedAt)
-- =====================================================
CREATE TABLE [Users] (
  [user_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [email] nvarchar(255) UNIQUE NOT NULL,
  [password] nvarchar(512) NOT NULL,
  [u_name] nvarchar(255),
  [phone_number] varchar(13),
  [address] nvarchar(255),
  [role] nvarchar(20) CHECK ([role] in(N'USER',N'EMPLOYEE',N'ADMIN')),
  [isActive] bit DEFAULT (1),
  [date_of_birth] date,
  [createdAt] datetime2 NOT NULL DEFAULT (SYSDATETIME()),
  [updatedAt] datetime2 NOT NULL DEFAULT (SYSDATETIME())
)
GO

-- =====================================================
-- Category Table
-- =====================================================
CREATE TABLE [Category] (
  [c_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [c_name] nvarchar(255) UNIQUE
)
GO

-- =====================================================
-- Brand Table
-- =====================================================
CREATE TABLE [Brand] (
  [brand_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [brand_name] nvarchar(255) UNIQUE
)
GO

-- =====================================================
-- Banner Table
-- Extends: Auditable (createdAt, updatedAt)
-- =====================================================
CREATE TABLE [Banner] (
  [banner_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [image_url] nvarchar(255),
  [is_active] bit DEFAULT (1),
  [title] nvarchar(128),
  [u_id] uniqueidentifier,
  [createdAt] datetime2 NOT NULL DEFAULT (SYSDATETIME()),
  [updatedAt] datetime2 NOT NULL DEFAULT (SYSDATETIME())
)
GO

-- =====================================================
-- Product Table
-- =====================================================
CREATE TABLE [Product] (
  [p_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [p_name] nvarchar(255),
  [p_desc] nvarchar(MAX),
  [price] decimal(10,2) NOT NULL check ([price]>0),
  [c_id] uniqueidentifier NOT NULL,
  [brand_id] uniqueidentifier NOT NULL,
  [is_active] bit DEFAULT (1)
)
GO

-- =====================================================
-- ProductDetails Table
-- Note: color_name and color_code are stored directly (not FK)
-- =====================================================
CREATE TABLE [ProductDetails] (
  [pd_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [p_id] uniqueidentifier NOT NULL,
  [color_name] nvarchar(64),
  [color_code] nvarchar(64),
  [img_list] nvarchar(MAX),
  [size] nvarchar(10),
  [amount] int DEFAULT (0),
  [in_stock] bit DEFAULT (1)
)
GO

-- =====================================================
-- Orders Table
-- =====================================================
CREATE TABLE [Orders] (
  [o_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [order_number] bigint UNIQUE NOT NULL DEFAULT (0),
  [u_id] uniqueidentifier NOT NULL,
  [status] nvarchar(50) CHECK ([status] in(N'PENDING', N'PROCESSING', N'SHIPPING', N'DELIVERED', N'CANCELLED')),
  [date_created] datetime2 DEFAULT (SYSDATETIME()),
  [total_price] decimal(10,2) NOT NULL,
  [payment_method] nvarchar(50),
  [shipping_address] nvarchar(500),
  [phone] varchar(20)
)
GO

-- =====================================================
-- OrderDetails Table
-- =====================================================
CREATE TABLE [OrderDetails] (
  [od_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [o_id] uniqueidentifier NOT NULL,
  [pd_id] uniqueidentifier NOT NULL,
  [quantity] int DEFAULT (1) CHECK ([quantity]>0),
  [price] decimal(10,2) NOT NULL CHECK ([price]>0)
)
GO

-- =====================================================
-- Rating Table
-- =====================================================
CREATE TABLE [Rating] (
  [r_id] uniqueidentifier PRIMARY KEY DEFAULT (NEWID()),
  [u_id] uniqueidentifier,
  [p_id] uniqueidentifier,
  [rating_value] int NOT NULL,
  CONSTRAINT CK_Rating_Value CHECK ([rating_value] BETWEEN 1 AND 5)
)
GO

-- =====================================================
-- Cart Table (NEW - Shopping Cart)
-- =====================================================
CREATE TABLE [Cart] (
  [cart_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [user_id] uniqueidentifier NOT NULL,
  [pd_id] uniqueidentifier NOT NULL,
  [quantity] int NOT NULL DEFAULT (1) CHECK ([quantity]>0),
  [created_at] datetime2 NOT NULL DEFAULT (SYSDATETIME()),
  [updated_at] datetime2 NOT NULL DEFAULT (SYSDATETIME())
)
GO

-- =====================================================
-- Foreign Key Constraints
-- =====================================================

-- Banner -> Users
ALTER TABLE [Banner] ADD FOREIGN KEY ([u_id]) REFERENCES [Users] ([user_id]) ON DELETE SET NULL
GO

-- Product -> Category
ALTER TABLE [Product] ADD FOREIGN KEY ([c_id]) REFERENCES [Category] ([c_id])
GO

-- Product -> Brand
ALTER TABLE [Product] ADD FOREIGN KEY ([brand_id]) REFERENCES [Brand] ([brand_id])
GO

-- ProductDetails -> Product
ALTER TABLE [ProductDetails] ADD FOREIGN KEY ([p_id]) REFERENCES [Product] ([p_id]) ON DELETE CASCADE
GO

-- Orders -> Users
ALTER TABLE [Orders] ADD FOREIGN KEY ([u_id]) REFERENCES [Users] ([user_id]) ON DELETE CASCADE
GO

-- OrderDetails -> Orders
ALTER TABLE [OrderDetails] ADD FOREIGN KEY ([o_id]) REFERENCES [Orders] ([o_id]) ON DELETE CASCADE
GO

-- OrderDetails -> ProductDetails
ALTER TABLE [OrderDetails] ADD FOREIGN KEY ([pd_id]) REFERENCES [ProductDetails] ([pd_id])
GO

-- Rating -> Product
ALTER TABLE [Rating] ADD FOREIGN KEY ([p_id]) REFERENCES [Product] ([p_id])
GO

-- Rating -> Users
ALTER TABLE [Rating] ADD FOREIGN KEY ([u_id]) REFERENCES [Users] ([user_id]) ON DELETE SET NULL
GO

-- Cart -> Users
ALTER TABLE [Cart] ADD FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id]) ON DELETE CASCADE
GO

-- Cart -> ProductDetails
ALTER TABLE [Cart] ADD FOREIGN KEY ([pd_id]) REFERENCES [ProductDetails] ([pd_id])
GO
