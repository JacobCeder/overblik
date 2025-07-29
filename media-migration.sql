-- Migration to update existing articles table for separate media fields
-- Run this AFTER the main schema if you have existing data

-- Add new columns for media name and url
ALTER TABLE articles ADD COLUMN IF NOT EXISTS media_name TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS media_url TEXT;

-- If you have existing data in the 'media' column, you can migrate it
-- This assumes the existing media column contains URLs
UPDATE articles 
SET media_url = media 
WHERE media IS NOT NULL AND media != '';

-- Optional: Remove the old media column after migration
-- ALTER TABLE articles DROP COLUMN IF EXISTS media;