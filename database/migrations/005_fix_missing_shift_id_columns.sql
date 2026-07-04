-- Migration: Fix missing shift_id columns on orders/expenses
-- Date: 2026-07-03
-- Description: Migration 003 intended to add `shift_id` to `orders` and `expenses`
--              using `ADD COLUMN IF NOT EXISTS`, but this MySQL 8.4 server does not
--              support that clause (confirmed: it throws ERROR 1064 on this server) and
--              the migration was nonetheless recorded as executed. As a result the
--              columns were never created, which breaks every order creation in
--              production (add_order.js inserts a `shift_id` value). This migration adds
--              the columns for real, using plain ADD COLUMN (safe here since they are
--              confirmed absent and this migration only runs once per the migrations table).

ALTER TABLE `orders`
ADD COLUMN `shift_id` INT NULL COMMENT 'Link order to shift session',
ADD INDEX `idx_shift_id` (`shift_id`);

ALTER TABLE `expenses`
ADD COLUMN `shift_id` INT NULL COMMENT 'Link expense to shift session',
ADD INDEX `idx_shift_id` (`shift_id`);
