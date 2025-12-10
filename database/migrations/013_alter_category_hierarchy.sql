-- Migration: Add hierarchy columns to Category table
-- Adds parent_id, level, display_order for category tree structure

ALTER TABLE Category 
ADD COLUMN parent_id CHAR(36) NULL,
ADD COLUMN level INT DEFAULT 0,
ADD COLUMN display_order INT DEFAULT 0;

-- Add index for parent_id
CREATE INDEX idx_category_parent ON Category(parent_id);

-- Add foreign key (optional - self-referencing)
-- ALTER TABLE Category ADD CONSTRAINT fk_category_parent 
--   FOREIGN KEY (parent_id) REFERENCES Category(c_id) ON DELETE SET NULL;
