-- ============================================================================
-- HR & PAYROLL SYSTEM UPDATES — Migration v11
-- Adds: effectiveDate to attendance_settings for historical policy tracking
-- ============================================================================

ALTER TABLE public.attendance_settings 
ADD COLUMN IF NOT EXISTS "effectiveDate" DATE NOT NULL DEFAULT CURRENT_DATE;

-- Since the system previously assumed a single row, let's make sure the existing row has an effective date far in the past so it applies to all old records.
UPDATE public.attendance_settings 
SET "effectiveDate" = '2020-01-01' 
WHERE "effectiveDate" = CURRENT_DATE;

-- We don't drop any constraints because there was no unique constraint on attendance_settings.
-- We will rely on effectiveDate to fetch the correct row.
