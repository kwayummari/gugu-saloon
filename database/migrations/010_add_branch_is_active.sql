-- Migration: Add is_active flag to branch and hide Main Branch
-- Date: 2026-07-18
-- Description: Owner requested Main Branch be temporarily removed from all
--              branch selectors/data views, leaving only Mwanyamala and
--              Kinondoni. Uses a flag (rather than deleting the row) so it
--              can be re-enabled later without touching code, and so Main
--              Branch's historical orders/data are preserved untouched.

ALTER TABLE `branch`
ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether this branch shows up in branch lists/selectors';

UPDATE `branch` SET `is_active` = FALSE WHERE `name` = 'Main Branch';
