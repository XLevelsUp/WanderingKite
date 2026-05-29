-- ============================================================================
-- ADD INCENTIVE COLUMN AND REJECTED STATUS — Migration v12
-- ============================================================================

-- 1. Add 'REJECTED' to the payroll_status enum
ALTER TYPE public.payroll_status ADD VALUE IF NOT EXISTS 'REJECTED';

-- 2. Add 'incentive' column to employee_contracts
ALTER TABLE public.employee_contracts 
ADD COLUMN IF NOT EXISTS "incentive" NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK ("incentive" >= 0);

-- 3. Add 'incentive' column to payroll_records
ALTER TABLE public.payroll_records 
ADD COLUMN IF NOT EXISTS "incentive" NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK ("incentive" >= 0);
