-- Migration: Create shifts system
-- Date: 2025-10-12
-- Description: Implements shift/session management for day/night operations

-- 1. Create shifts table
CREATE TABLE IF NOT EXISTS `shifts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` INT NOT NULL,
    `manager_id` INT NOT NULL,
    `manager_name` VARCHAR(255) NOT NULL,
    `shift_type` ENUM('day', 'night', 'full_day') NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NULL,
    `status` ENUM('active', 'ended') DEFAULT 'active',
    
    -- Financial Summary (calculated at shift end)
    `total_orders` INT DEFAULT 0,
    `total_revenue` DECIMAL(10,2) DEFAULT 0,
    `total_hairdresser_amount` DECIMAL(10,2) DEFAULT 0,
    `total_office_amount` DECIMAL(10,2) DEFAULT 0,
    `total_cost_of_hair` DECIMAL(10,2) DEFAULT 0,
    `total_vishanga` DECIMAL(10,2) DEFAULT 0,
    `total_expenses` DECIMAL(10,2) DEFAULT 0,
    `net_profit` DECIMAL(10,2) DEFAULT 0,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX (`branch_id`),
    INDEX (`manager_id`),
    INDEX (`status`),
    INDEX (`start_time`),
    INDEX (`shift_type`)
);

-- 2. Add shift configuration to branch table
ALTER TABLE `branch` 
ADD COLUMN IF NOT EXISTS `has_shifts` BOOLEAN DEFAULT FALSE COMMENT 'Does this branch operate in day/night shifts?',
ADD COLUMN IF NOT EXISTS `shift_config` JSON DEFAULT NULL COMMENT 'Shift configuration: {"day_start": "08:00", "night_start": "18:00"}';

-- 3. Link orders to shifts
ALTER TABLE `orders` 
ADD COLUMN IF NOT EXISTS `shift_id` INT NULL COMMENT 'Link order to shift session',
ADD INDEX IF NOT EXISTS `idx_shift_id` (`shift_id`);

-- 4. Link expenses to shifts
ALTER TABLE `expenses` 
ADD COLUMN IF NOT EXISTS `shift_id` INT NULL COMMENT 'Link expense to shift session',
ADD INDEX IF NOT EXISTS `idx_shift_id` (`shift_id`);

-- 5. Update existing branches - set default configuration
-- Branch 1: Has shifts (day/night)
UPDATE `branch` SET 
    `has_shifts` = TRUE,
    `shift_config` = '{"types": ["day", "night"], "day_start": "08:00", "night_start": "18:00"}'
WHERE `id` = 1 AND `has_shifts` IS NULL;

-- Branch 2: No shifts (full day)
UPDATE `branch` SET 
    `has_shifts` = FALSE,
    `shift_config` = '{"types": ["full_day"]}'
WHERE `id` = 2 AND `has_shifts` IS NULL;

