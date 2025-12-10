-- Migration: Add selected_size column to Cart table
-- This allows storing which size the user selected when adding to cart

ALTER TABLE Cart ADD COLUMN selected_size VARCHAR(20) DEFAULT NULL AFTER pd_id;

-- Update unique constraint to include selected_size
-- First drop the old constraint
ALTER TABLE Cart DROP INDEX unique_user_product;

-- Add new unique constraint including selected_size
ALTER TABLE Cart ADD UNIQUE KEY unique_user_product_size (user_id, pd_id, selected_size);
