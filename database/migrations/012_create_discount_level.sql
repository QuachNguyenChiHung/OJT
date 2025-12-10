-- Migration: Create DiscountLevel table
-- Stores custom discount percentages that admin can create/delete

CREATE TABLE IF NOT EXISTS DiscountLevel (
    id VARCHAR(36) PRIMARY KEY,
    discount_percent INT NOT NULL UNIQUE,
    name VARCHAR(50) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (discount_percent >= 1 AND discount_percent <= 99)
);

-- Insert default discount levels
INSERT IGNORE INTO DiscountLevel (id, discount_percent, name) VALUES
    (UUID(), 10, 'Giảm 10%'),
    (UUID(), 20, 'Giảm 20%'),
    (UUID(), 30, 'Giảm 30%'),
    (UUID(), 50, 'Giảm 50%');
