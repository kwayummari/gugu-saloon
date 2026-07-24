-- Migration: Account-based shift type
-- Date: 2026-07-24
-- Description: Shift type (day/night) is now determined by which manager
-- account starts the shift, instead of the current clock time.

-- 1. Add shift_type to user accounts (day accounts stay 'day' by default)
ALTER TABLE `user`
ADD COLUMN `shift_type` ENUM('day', 'night') NOT NULL DEFAULT 'day'
COMMENT 'Which shift this account records orders/expenses under';

-- 2. Existing accounts are explicitly day accounts
UPDATE `user` SET `shift_type` = 'day' WHERE id IN (1, 2, 3);

-- 3. Night-manager accounts, one per branch
INSERT INTO `user` (fullname, phone, email, branch, role, password, companyId, shift_type)
VALUES
  ('Main Branch Night Manager', '0700000010', 'nightmain@gugubeauty.com', 1, 2, '$2b$10$cMmy9k.Os0U0DsJeLMBD..OtH7v5tw/Q6EHllOoa7gBQ7vy6esaxS', 1, 'night'),
  ('Mwanyamala Night Manager', '0700000011', 'nightmwanya@gugubeauty.com', 2, 2, '$2b$10$TGMoS2U1ZumccJD1I7xqAeWhG.k8DdeZDN0fPb69rQ52USHfAmK/2', 1, 'night'),
  ('Kinondoni Night Manager', '0700000012', 'nightkinondoni@gugubeauty.com', 3, 2, '$2b$10$pCexkUYw9F.O0eBcF0y6F.lYBXjltbO3evgkky3ki95BPjwhDHwHi', 1, 'night');
