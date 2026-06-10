-- Migration 00022: Separate Studio Space & External Rental Pricing Structures

-- 1. Add Studio Space pricing columns to public.equipment
ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS "studioPricingPlans" JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS studio_hourly_rate DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS studio_daily_rate DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS studio_weekly_rate DECIMAL(10,2) DEFAULT 0.00;

-- 2. Migrate existing records: if equipment is marked as studio space, copy the general pricing plans to the new studio columns
UPDATE public.equipment
SET 
  "studioPricingPlans" = "pricingPlans",
  studio_hourly_rate = COALESCE(hourly_rate, 0.00),
  studio_daily_rate = COALESCE(daily_rate, 0.00),
  studio_weekly_rate = COALESCE(weekly_rate, 0.00)
WHERE is_studio_space = true;
