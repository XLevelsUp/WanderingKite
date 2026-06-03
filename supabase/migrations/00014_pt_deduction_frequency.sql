-- 00014_pt_deduction_frequency.sql

ALTER TABLE "public"."attendance_settings" 
ADD COLUMN IF NOT EXISTS "ptDeductionFrequency" text DEFAULT 'MONTHLY';
