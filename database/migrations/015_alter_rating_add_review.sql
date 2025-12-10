-- Add review and created_at columns to Rating table
ALTER TABLE Rating 
ADD COLUMN review TEXT NULL AFTER rating_value,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER review;
