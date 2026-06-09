-- Migration 00019: Standardize pricing plan durations
-- Updates all Daily plan durationHours to 8 and Weekly plan durationHours to 56 consistently.

UPDATE public.equipment
SET "pricingPlans" = (
  SELECT COALESCE(jsonb_agg(
    CASE 
      WHEN (plan->>'name') ILIKE 'Daily' OR (plan->>'name') ILIKE 'day' THEN 
        jsonb_set(plan, '{durationHours}', '8'::jsonb)
      WHEN (plan->>'name') ILIKE 'Weekly' OR (plan->>'name') ILIKE 'week' THEN 
        jsonb_set(plan, '{durationHours}', '56'::jsonb)
      ELSE plan
    END
  ), '[]'::jsonb)
  FROM jsonb_array_elements("pricingPlans") AS plan
)
WHERE "pricingPlans" IS NOT NULL AND jsonb_typeof("pricingPlans") = 'array';
