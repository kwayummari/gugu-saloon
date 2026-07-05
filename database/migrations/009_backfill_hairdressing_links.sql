-- Migration: Backfill hairDressing links for seeded hairdressers/hairstyles
-- Date: 2026-07-05
-- Description: Migrations 007 and 008 inserted hairdresser and hairStyle rows
--              directly via SQL, bypassing the app's normal registerHairDresser
--              flow which auto-links a new hairdresser to every hairstyle in
--              their branch (see models/hairdresser/add_hairdresser.js). This
--              backfills that missing hairDressing linkage for any
--              hairdresser/hairStyle pair sharing a branch that isn't linked
--              yet. Safe to re-run (skips pairs that already exist).

INSERT INTO `hairDressing` (`hairStyleId`, `hairdresserId`)
SELECT hs.id, hd.id
FROM `hairStyle` hs
INNER JOIN `hairdresser` hd ON hd.branchId = hs.branchId
LEFT JOIN `hairDressing` existing
  ON existing.hairStyleId = hs.id AND existing.hairdresserId = hd.id
WHERE existing.id IS NULL;
