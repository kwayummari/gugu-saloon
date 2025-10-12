-- Migration: Create login_history table
-- Tracks all login activities for security and audit purposes
-- Date: 2025-10-11

CREATE TABLE IF NOT EXISTS `login_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `user_type` ENUM('hairdresser', 'admin', 'user') NOT NULL DEFAULT 'hairdresser',
  `login_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `status` ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  `sms_sent` TINYINT(1) NOT NULL DEFAULT 0,
  `sms_status` VARCHAR(50) NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_login_time` (`login_time`),
  INDEX `idx_user_type` (`user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

