-- ============================================================================
-- ROLLBACK for MIGRATION 00015: Equipment Tracking Upgrades
-- Run this ONLY if 00015_equipment_tracking_upgrade.sql needs to be reverted.
-- WARNING: This will permanently DELETE all data in the new columns and tables.
-- ============================================================================

-- Step 1: Drop the trigger first (depends on the function)
DROP TRIGGER IF EXISTS trg_check_assignment_clash ON public.equipment_assignments;

-- Step 2: Drop the trigger function
DROP FUNCTION IF EXISTS check_equipment_assignment_clash();

-- Step 3: Drop the audit clash logs table (and all its data)
DROP TABLE IF EXISTS public.audit_clash_logs;

-- Step 4: Remove the new columns from the equipment table
--         (all stored values in these columns will be lost)
ALTER TABLE public.equipment
  DROP COLUMN IF EXISTS purchase_bill,
  DROP COLUMN IF EXISTS purchase_date,
  DROP COLUMN IF EXISTS warranty_duration_months,
  DROP COLUMN IF EXISTS warranty_expiration_date,
  DROP COLUMN IF EXISTS service_cost,
  DROP COLUMN IF EXISTS repair_cost,
  DROP COLUMN IF EXISTS ownership_type;

-- Step 5: Restore the original unique index that was dropped in the migration
--         (prevents more than one active assignment per equipment at a time,
--          the old simple behaviour before date-range clash detection)
CREATE UNIQUE INDEX IF NOT EXISTS uq_ea_equipment_active
  ON public.equipment_assignments ("equipmentId")
  WHERE "returnedAt" IS NULL;

-- ============================================================================
-- Rollback complete. The equipment table is back to its state before migration 00015.
-- ============================================================================
