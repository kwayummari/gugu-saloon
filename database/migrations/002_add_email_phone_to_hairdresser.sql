-- Migration: Add email and phone columns to hairdresser table
-- This enables login with email, phone, or username
-- Date: 2025-10-11

-- Add email column (if not exists)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'hairdresser' 
                   AND COLUMN_NAME = 'email');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `hairdresser` ADD COLUMN `email` VARCHAR(255) NULL UNIQUE AFTER `name`',
  'SELECT "Column email already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add phone column (if not exists)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'hairdresser' 
                   AND COLUMN_NAME = 'phone');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `hairdresser` ADD COLUMN `phone` VARCHAR(20) NULL UNIQUE AFTER `email`',
  'SELECT "Column phone already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_hairdresser_email ON hairdresser(email);
CREATE INDEX IF NOT EXISTS idx_hairdresser_phone ON hairdresser(phone);

