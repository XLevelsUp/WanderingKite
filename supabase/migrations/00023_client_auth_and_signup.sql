-- =============================================================================
-- Migration: 00023_client_auth_and_signup.sql
-- =============================================================================
-- Purpose:
--   1. Create "ServiceType" ENUM for client selections.
--   2. Alter "clients" table to support auth (password, names, isActive, etc.).
--   3. Create "client_services" join table for client service interests.
--   4. Enable RLS and setup updated_at triggers.
-- =============================================================================

BEGIN;

-- 1. Create ServiceType enum for client selection
DO $$ BEGIN
  CREATE TYPE public."ServiceType" AS ENUM ('PHOTOGRAPHY', 'RENTALS', 'STUDIO_SPACE');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'ServiceType ENUM already exists — skipping creation.';
END $$;

-- 2. Alter clients table to add registration and auth fields
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Create client_services join table
CREATE TABLE IF NOT EXISTS public.client_services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type        public."ServiceType" NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (client_id, type)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for client_services
DROP POLICY IF EXISTS "Authenticated users can view client services" ON public.client_services;
CREATE POLICY "Authenticated users can view client services"
  ON public.client_services FOR SELECT
  USING (auth.uid() is not null);

DROP POLICY IF EXISTS "Staff can manage client services" ON public.client_services;
CREATE POLICY "Super admin can manage client services"
  ON public.client_services FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN')
  WITH CHECK (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- 6. Add updated_at trigger for client_services
DROP TRIGGER IF EXISTS trg_client_services_updated_at ON public.client_services;
CREATE TRIGGER trg_client_services_updated_at
  BEFORE UPDATE ON public.client_services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMIT;
