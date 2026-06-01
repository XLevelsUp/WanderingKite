-- ============================================================================
-- HR & PAYROLL SYSTEM UPDATES — Migration v10
-- Adds: new attendance enums and additional fields to payroll_records
-- ============================================================================

-- Stage 1: Add new values to attendance_status enum type
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a multi-statement transaction in PostgreSQL.
-- If running this script in Supabase, make sure to execute these statements.
ALTER TYPE public.attendance_status ADD VALUE IF NOT EXISTS 'ON_AID_LEAVE';
ALTER TYPE public.attendance_status ADD VALUE IF NOT EXISTS 'LEAVE';

-- Stage 2: Add allowedPaidLeavesPerMonth to attendance_settings
ALTER TABLE public.attendance_settings ADD COLUMN IF NOT EXISTS "allowedPaidLeavesPerMonth" INTEGER NOT NULL DEFAULT 0;

-- Stage 3: Add granular tracking columns to payroll_records
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "absentDays" NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "leaveDays" NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "paidLeavesUsed" NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "halfDays" NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "onAidLeaveDays" NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "deductionDays" NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "perDaySalary" NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "deductionsTotal" NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "incentiveHours" NUMERIC(6,2) NOT NULL DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS "overtimeHours" NUMERIC(6,2) NOT NULL DEFAULT 0;
