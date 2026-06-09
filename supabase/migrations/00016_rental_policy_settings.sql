-- Migration 00016: Equipment Rental Policy Settings

-- 1. Create rental_policy_settings table (Global Settings)
CREATE TABLE IF NOT EXISTS public.rental_policy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repeat_client_discount_percentage DECIMAL(5,2) DEFAULT 0.00, -- Configurable by Super Admin
    default_security_deposit DECIMAL(10,2) DEFAULT 0.00,
    default_late_penalty_rate DECIMAL(5,2) DEFAULT 0.00, -- Multiplier applied to daily rate when late
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial row
INSERT INTO public.rental_policy_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000000') 
ON CONFLICT DO NOTHING;

-- 2. Add columns to equipment table
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS min_rental_duration_hours INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS late_penalty_rate DECIMAL(5,2) DEFAULT 2.00,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'GOOD' CHECK (condition IN ('NEW', 'GOOD', 'FAIR')),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weekly_rate DECIMAL(10,2);

-- Populate hourly, daily, weekly rate from pricingPlans JSONB to relational columns for easier access
UPDATE public.equipment
SET 
  hourly_rate = COALESCE((SELECT (elem->>'rate')::numeric FROM jsonb_array_elements("pricingPlans") elem WHERE elem->>'name' ILIKE 'hourly' LIMIT 1), 0),
  daily_rate = COALESCE((SELECT (elem->>'rate')::numeric FROM jsonb_array_elements("pricingPlans") elem WHERE elem->>'name' ILIKE 'daily' LIMIT 1), 0),
  weekly_rate = COALESCE((SELECT (elem->>'rate')::numeric FROM jsonb_array_elements("pricingPlans") elem WHERE elem->>'name' ILIKE 'weekly' LIMIT 1), 0);

-- 3. Create client_custom_contracts table
CREATE TABLE IF NOT EXISTS public.client_custom_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    custom_hourly_rate DECIMAL(10,2),
    custom_daily_rate DECIMAL(10,2),
    custom_weekly_rate DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, equipment_id)
);

-- Enable RLS for all
ALTER TABLE public.rental_policy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_custom_contracts ENABLE ROW LEVEL SECURITY;

-- Add Policies
CREATE POLICY "Admins can view rental_policy_settings"
  ON public.rental_policy_settings
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')));

CREATE POLICY "Super Admins can manage rental_policy_settings"
  ON public.rental_policy_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN'));

CREATE POLICY "Admins can view client_custom_contracts"
  ON public.client_custom_contracts
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')));

CREATE POLICY "Super Admins can manage client_custom_contracts"
  ON public.client_custom_contracts
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN'));
