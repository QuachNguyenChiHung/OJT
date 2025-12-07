DROP TABLE IF EXISTS [OrderDetails];
DROP TABLE IF EXISTS [Orders];
DROP TABLE IF EXISTS [Rating];
DROP TABLE IF EXISTS [ProductDetails];
DROP TABLE IF EXISTS [Banner];

-- Drop tables that are referenced by others
DROP TABLE IF EXISTS [Product];
DROP TABLE IF EXISTS [Color];
DROP TABLE IF EXISTS [Category];
DROP TABLE IF EXISTS [Brand];
DROP TABLE IF EXISTS [Users];

CREATE TABLE [Users] (
  [user_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [email] nvarchar(255) UNIQUE NOT NULL,
  [phone_number] varchar(13),
  [u_name] nvarchar(255),
  [address] nvarchar(255),
  [role] nvarchar(20) CHECK ([role] in(N'USER',N'EMPLOYEE',N'ADMIN')),
  [isActive] bit ,
  [date_of_birth] date,
  [password] nvarchar(512)
)
GO

CREATE TABLE [Banner] (
  [banner_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [image_url] nvarchar(255),
  [is_active] bit,
  [title] nvarchar(128),
  [u_id] uniqueidentifier
)
GO

CREATE TABLE [Orders] (
  [o_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [u_id] uniqueidentifier NOT NULL,
  [status] nvarchar(50) check([status] in(N'PENDING', N'PROCESSING', N'SHIPPING', N'DELIVERED', N'CANCELLED')),
  [date_created] datetime DEFAULT (GETDATE()),
  [total_price] decimal(10,2) NOT NULL
)
GO

CREATE TABLE [OrderDetails] (
  [od_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [o_id] uniqueidentifier NOT NULL,
  [pd_id] uniqueidentifier NOT NULL,
  [quantity] int DEFAULT (1) check ([quantity]>0 ),
  [price] decimal(10,2) NOT NULL check ([price]>0 )
)
GO

CREATE TABLE [Product] (
  [p_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [p_name] nvarchar(255),
  [c_id] uniqueidentifier NOT NULL,
  [brand_id] uniqueidentifier NOT NULL,
  [p_desc] nvarchar(MAX),
  [price] decimal(10,2) NOT NULL check ([price]>0 )
)
GO

CREATE TABLE [Rating] (
  [r_id] uniqueidentifier PRIMARY KEY DEFAULT (NEWID()),
  [u_id] uniqueidentifier,
  [rating_value] int NOT NULL ([rating_value] BETWEEN 1 AND 5),
  [p_id] uniqueidentifier
)
GO

CREATE TABLE [Category] (
  [c_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [c_name] nvarchar(255) UNIQUE
)
GO

CREATE TABLE [Brand] (
  [brand_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [brand_name] nvarchar(255) UNIQUE
)
GO

CREATE TABLE [ProductDetails] (
  [pd_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [p_id] uniqueidentifier NOT NULL,
  [img_list] nvarchar(MAX),
  [size] nvarchar(10),
  [color_id] uniqueidentifier,
  [amount] int,
  [in_stock] bit default(1)
)
GO

CREATE TABLE [Color] (
  [color_id] uniqueidentifier PRIMARY KEY NOT NULL DEFAULT (NEWID()),
  [color_name] nvarchar(64),
  [color_code] nvarchar(64)
)
GO

ALTER TABLE [Banner] ADD FOREIGN KEY ([u_id]) REFERENCES [Users] ([user_id]) ON DELETE SET NULL
GO

ALTER TABLE [Orders] ADD FOREIGN KEY ([u_id]) REFERENCES [Users] ([user_id]) ON DELETE CASCADE
GO

ALTER TABLE [OrderDetails] ADD FOREIGN KEY ([pd_id]) REFERENCES [ProductDetails] ([pd_id])
GO

ALTER TABLE [OrderDetails] ADD FOREIGN KEY ([o_id]) REFERENCES [Orders] ([o_id]) ON DELETE CASCADE
GO

ALTER TABLE [Product] ADD FOREIGN KEY ([c_id]) REFERENCES [Category] ([c_id])
GO

ALTER TABLE [Product] ADD FOREIGN KEY ([brand_id]) REFERENCES [Brand] ([brand_id])
GO

ALTER TABLE [Rating] ADD FOREIGN KEY ([p_id]) REFERENCES [Product] ([p_id])
GO

ALTER TABLE [Rating] ADD FOREIGN KEY ([u_id]) REFERENCES [Users] ([user_id]) ON DELETE SET NULL
GO

ALTER TABLE [ProductDetails] ADD FOREIGN KEY ([color_id]) REFERENCES [Color] ([color_id])
GO

ALTER TABLE [ProductDetails] ADD FOREIGN KEY ([p_id]) REFERENCES [Product] ([p_id]) ON DELETE CASCADE
GO
