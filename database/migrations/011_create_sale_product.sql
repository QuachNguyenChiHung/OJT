-- Migration: Create SaleProduct table
-- Stores products that are on sale with discount information

CREATE TABLE IF NOT EXISTS SaleProduct (
    p_id VARCHAR(36) NOT NULL,
    discount_percent INT NOT NULL DEFAULT 20,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (p_id),
    FOREIGN KEY (p_id) REFERENCES Product(p_id) ON DELETE CASCADE,
    CHECK (discount_percent >= 1 AND discount_percent <= 99)
);

-- Index for active sale products
CREATE INDEX idx_sale_active ON SaleProduct(is_active);
CREATE INDEX idx_sale_dates ON SaleProduct(start_date, end_date);
