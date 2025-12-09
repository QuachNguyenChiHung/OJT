-- MySQL Schema for OJT E-commerce (RDS Aurora MySQL)
-- Converted from aws.sql (SQL Server) to MySQL syntax
-- Version 2.0

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables in correct order (dependents first)
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS OrderDetails;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Rating;
DROP TABLE IF EXISTS ProductDetails;
DROP TABLE IF EXISTS Banner;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Brand;
DROP TABLE IF EXISTS Users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Users Table
-- =====================================================
CREATE TABLE Users (
  user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(512) NOT NULL,
  u_name VARCHAR(255),
  phone_number VARCHAR(13),
  address VARCHAR(255),
  role ENUM('USER', 'EMPLOYEE', 'ADMIN') DEFAULT 'USER',
  isActive BOOLEAN DEFAULT TRUE,
  date_of_birth DATE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Category Table
-- =====================================================
CREATE TABLE Category (
  c_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  c_name VARCHAR(255) UNIQUE NOT NULL,
  INDEX idx_c_name (c_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Brand Table
-- =====================================================
CREATE TABLE Brand (
  brand_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  brand_name VARCHAR(255) UNIQUE NOT NULL,
  INDEX idx_brand_name (brand_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Banner Table
-- =====================================================
CREATE TABLE Banner (
  banner_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  title VARCHAR(128),
  u_id CHAR(36),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Product Table
-- =====================================================
CREATE TABLE Product (
  p_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  p_name VARCHAR(255) NOT NULL,
  p_desc TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  c_id CHAR(36) NOT NULL,
  brand_id CHAR(36) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_p_name (p_name),
  INDEX idx_c_id (c_id),
  INDEX idx_brand_id (brand_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ProductDetails Table
-- =====================================================
CREATE TABLE ProductDetails (
  pd_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  p_id CHAR(36) NOT NULL,
  color_name VARCHAR(64),
  color_code VARCHAR(64),
  img_list JSON,
  size VARCHAR(10),
  amount INT DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  INDEX idx_p_id (p_id),
  INDEX idx_in_stock (in_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Orders Table
-- =====================================================
CREATE TABLE Orders (
  o_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_number BIGINT UNIQUE,
  u_id CHAR(36) NOT NULL,
  status ENUM('PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_price DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  shipping_address VARCHAR(500),
  phone VARCHAR(20),
  INDEX idx_u_id (u_id),
  INDEX idx_status (status),
  INDEX idx_date_created (date_created)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- OrderDetails Table
-- =====================================================
CREATE TABLE OrderDetails (
  od_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  o_id CHAR(36) NOT NULL,
  pd_id CHAR(36) NOT NULL,
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  INDEX idx_o_id (o_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Rating Table
-- =====================================================
CREATE TABLE Rating (
  r_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  u_id CHAR(36),
  p_id CHAR(36),
  rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  INDEX idx_p_id (p_id),
  INDEX idx_rating_value (rating_value),
  UNIQUE KEY unique_user_product_rating (u_id, p_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Cart Table (Shopping Cart)
-- =====================================================
CREATE TABLE Cart (
  cart_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  pd_id CHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, pd_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Foreign Key Constraints
-- =====================================================

-- Banner -> Users
ALTER TABLE Banner ADD CONSTRAINT fk_banner_user 
  FOREIGN KEY (u_id) REFERENCES Users(user_id) ON DELETE SET NULL;

-- Product -> Category
ALTER TABLE Product ADD CONSTRAINT fk_product_category 
  FOREIGN KEY (c_id) REFERENCES Category(c_id) ON DELETE RESTRICT;

-- Product -> Brand
ALTER TABLE Product ADD CONSTRAINT fk_product_brand 
  FOREIGN KEY (brand_id) REFERENCES Brand(brand_id) ON DELETE RESTRICT;

-- ProductDetails -> Product
ALTER TABLE ProductDetails ADD CONSTRAINT fk_productdetails_product 
  FOREIGN KEY (p_id) REFERENCES Product(p_id) ON DELETE CASCADE;

-- Orders -> Users
ALTER TABLE Orders ADD CONSTRAINT fk_orders_user 
  FOREIGN KEY (u_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- OrderDetails -> Orders
ALTER TABLE OrderDetails ADD CONSTRAINT fk_orderdetails_order 
  FOREIGN KEY (o_id) REFERENCES Orders(o_id) ON DELETE CASCADE;

-- OrderDetails -> ProductDetails
ALTER TABLE OrderDetails ADD CONSTRAINT fk_orderdetails_productdetails 
  FOREIGN KEY (pd_id) REFERENCES ProductDetails(pd_id) ON DELETE RESTRICT;

-- Rating -> Product
ALTER TABLE Rating ADD CONSTRAINT fk_rating_product 
  FOREIGN KEY (p_id) REFERENCES Product(p_id) ON DELETE CASCADE;

-- Rating -> Users
ALTER TABLE Rating ADD CONSTRAINT fk_rating_user 
  FOREIGN KEY (u_id) REFERENCES Users(user_id) ON DELETE SET NULL;

-- Cart -> Users
ALTER TABLE Cart ADD CONSTRAINT fk_cart_user 
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- Cart -> ProductDetails
ALTER TABLE Cart ADD CONSTRAINT fk_cart_productdetails 
  FOREIGN KEY (pd_id) REFERENCES ProductDetails(pd_id) ON DELETE CASCADE;

-- =====================================================
-- Sample Data
-- =====================================================

-- Insert sample categories
INSERT INTO Category (c_id, c_name) VALUES
  (UUID(), 'Women'),
  (UUID(), 'Men'),
  (UUID(), 'Unisex');

-- Insert sample brands
INSERT INTO Brand (brand_id, brand_name) VALUES
  (UUID(), 'Nike'),
  (UUID(), 'Adidas'),
  (UUID(), 'Puma'),
  (UUID(), 'Gucci'),
  (UUID(), 'Zara');

-- Insert admin user (password: Admin@123 - bcrypt hash)
INSERT INTO Users (user_id, email, password, u_name, role, isActive) VALUES
  (UUID(), 'admin@ojt.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tTmMYjKQBjmPp7NNaB3.Hisu', 'Admin User', 'ADMIN', TRUE);

SELECT 'Schema v2 created successfully!' AS status;
