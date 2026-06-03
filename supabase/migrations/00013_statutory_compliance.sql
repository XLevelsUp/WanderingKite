-- ============================================================================
-- HR & PAYROLL SYSTEM UPDATES — Migration v13
-- Adds: Statutory compliance fields (PF, PT, TDS), employee configuration,
--       and global attendance settings overrides.
-- ============================================================================

-- Stage 1: Add new columns to employee_contracts
ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS "employeeNumber" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "department" TEXT,
  ADD COLUMN IF NOT EXISTS "pfEnrolled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "pfContinued" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "ptExempt" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "tdsExempt" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "exemptionReason" TEXT;

-- Stage 2: Add global settings to attendance_settings
ALTER TABLE public.attendance_settings
  ADD COLUMN IF NOT EXISTS "pfWageCeiling" NUMERIC(10,2) NOT NULL DEFAULT 15000.00,
  ADD COLUMN IF NOT EXISTS "pfContributionPercent" NUMERIC(5,2) NOT NULL DEFAULT 12.00,
  ADD COLUMN IF NOT EXISTS "pfAutoEnrollAboveCeiling" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "ptState" TEXT NOT NULL DEFAULT 'Tamil Nadu',
  ADD COLUMN IF NOT EXISTS "tdsRegime" TEXT NOT NULL DEFAULT 'New Regime FY 2025-26',
  ADD COLUMN IF NOT EXISTS "enablePF" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "enablePT" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "enableTDS" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "ptSlabs" JSONB DEFAULT '[
    {"max": 3500, "amount": 0},
    {"min": 3501, "max": 5000, "amount": 22.50},
    {"min": 5001, "max": 7500, "amount": 52.50},
    {"min": 7501, "max": 10000, "amount": 115.00},
    {"min": 10001, "max": 12500, "amount": 171.00},
    {"min": 12501, "max": 999999999, "amount": 208.33}
  ]'::jsonb;

-- Stage 3: Add explicit tracking columns to payroll_records
ALTER TABLE public.payroll_records
  ADD COLUMN IF NOT EXISTS "pfAmount" NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "ptAmount" NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tdsAmount" NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "grossEarnings" NUMERIC(12,2) NOT NULL DEFAULT 0;

-- Verification block (optional, prints to console when running via CLI)
DO $$
BEGIN
  RAISE NOTICE 'Migration 13 applied successfully. Added employeeNumber, department, and compliance fields.';
END $$;
