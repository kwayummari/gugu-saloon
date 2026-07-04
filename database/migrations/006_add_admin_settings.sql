-- Migration: Store the admin SMS notification phone number in the database
-- Date: 2026-07-05
-- Description: Previously the admin phone number (recipient of login-alert and
--              order-alert SMS) was only configurable via the ADMIN_PHONE env
--              var. This adds a single-row settings table so it can be
--              edited from the UI instead, seeded with the current env default.

CREATE TABLE IF NOT EXISTS `company_settings` (
  `id` INT NOT NULL,
  `admin_phone` VARCHAR(20) DEFAULT NULL COMMENT 'Recipient phone number for admin SMS alerts',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `company_settings` (`id`, `admin_phone`) VALUES (1, '0762996305')
ON DUPLICATE KEY UPDATE `admin_phone` = `admin_phone`;
