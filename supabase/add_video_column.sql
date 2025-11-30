-- Add video_url column to existing products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
