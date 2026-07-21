-- Migration 00011: Transition equipment pricing to custom dynamic plans
-- Automatically migrates daily/weekly columns to JSONB plans

-- 1. Add pricingPlans JSONB column
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS "pricingPlans" JSONB DEFAULT '[]'::jsonb;

-- 2. Migrate existing records to JSONB plans to avoid data loss
UPDATE public.equipment
SET "pricingPlans" = jsonb_build_array(
  jsonb_build_object('name', 'Hourly', 'durationHours', 1, 'rate', ROUND("rentalPrice" / 10)),
  jsonb_build_object('name', 'Daily', 'durationHours', 24, 'rate', "rentalPrice"),
  jsonb_build_object('name', 'Weekly', 'durationHours', 168, 'rate', COALESCE("weeklyPrice", 0))
)
WHERE ("pricingPlans" = '[]'::jsonb OR "pricingPlans" IS NULL) AND "rentalPrice" IS NOT NULL;

-- 3. Drop deprecated columns
ALTER TABLE public.equipment DROP COLUMN IF EXISTS "rentalPrice";
ALTER TABLE public.equipment DROP COLUMN IF EXISTS "weeklyPrice";
ALTER TABLE public.equipment DROP COLUMN IF EXISTS "weekly_price";
