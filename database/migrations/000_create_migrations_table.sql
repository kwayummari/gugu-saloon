-- Migration: Create migrations tracking table
-- This table keeps track of which migrations have been run
-- Date: 2025-10-11

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `migration_name` VARCHAR(255) NOT NULL UNIQUE,
  `executed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_migration_name` (`migration_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

