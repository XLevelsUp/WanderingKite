-- Migration: 00031_studio_booking_conflicts_hardening.sql
-- Purpose: 
--   1. Add override boolean column to studio_bookings.
--   2. Update the check_studio_booking_overlap trigger function to bypass checks if override is true.
--   3. Add created_booking_id to studio_booking_conflicts.
--   4. Strengthen chk_resolution_consistency and apply additional validation constraints.
--   5. Build performance indexes.
--   6. Drop legacy Admin RLS policy on studio_booking_conflicts, verifying only the Super Admin policy from 00030 remains active for administrators.
--   7. Restrict override = true on studio_bookings to SUPER_ADMIN role only via RLS policies.

BEGIN;

-- 1. Add override boolean column to studio_bookings
ALTER TABLE public.studio_bookings 
  ADD COLUMN IF NOT EXISTS override BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Update the overlap trigger function to bypass checks if override is true
CREATE OR REPLACE FUNCTION public.check_studio_booking_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_overlap_exists BOOLEAN;
  v_new_start TIMESTAMPTZ := NEW.date_time;
  v_new_end TIMESTAMPTZ := NEW.date_time + (NEW.duration_hours * INTERVAL '1 hour') + INTERVAL '30 minutes';
BEGIN
  IF NEW.status IN ('PENDING', 'CONFIRMED') THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.studio_bookings sb
      WHERE sb.id <> NEW.id
        AND sb.status IN ('PENDING', 'CONFIRMED')
        AND sb.date_time < v_new_end
        AND (sb.date_time + (sb.duration_hours * INTERVAL '1 hour') + INTERVAL '30 minutes') > v_new_start
    ) INTO v_overlap_exists;

    -- Bypass constraint check if override is true
    IF v_overlap_exists AND NOT NEW.override THEN
      RAISE EXCEPTION 'Studio booking overlap detected. The requested time slot (including a 30-minute cleaning buffer) conflicts with an existing active booking.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Add created_booking_id column to associate override bookings in studio_booking_conflicts
ALTER TABLE public.studio_booking_conflicts 
  ADD COLUMN IF NOT EXISTS created_booking_id UUID REFERENCES public.studio_bookings(id) ON DELETE SET NULL;

-- 4. Apply validations & CHECK constraints
-- Drop and recreate chk_resolution_consistency to strengthen it
ALTER TABLE public.studio_booking_conflicts DROP CONSTRAINT IF EXISTS chk_resolution_consistency;
ALTER TABLE public.studio_booking_conflicts
  ADD CONSTRAINT chk_resolution_consistency CHECK (
    (status = 'blocked' AND resolved_at IS NULL AND resolved_by_id IS NULL) OR
    (status IN ('approved', 'rejected') AND resolved_at IS NOT NULL AND resolved_by_id IS NOT NULL)
  );

DO $$
BEGIN
  -- Ensure attempted purpose is not empty or whitespace-only
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_attempted_purpose_not_empty') THEN
    ALTER TABLE public.studio_booking_conflicts
      ADD CONSTRAINT chk_attempted_purpose_not_empty CHECK (char_length(trim(attempted_purpose)) > 0);
  END IF;

  -- Ensure client email has a basic valid format
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_client_email_format') THEN
    ALTER TABLE public.studio_booking_conflicts
      ADD CONSTRAINT chk_client_email_format CHECK (client_email LIKE '%@%');
  END IF;
END $$;

-- 5. Create Performance Indexes for query optimizations
CREATE INDEX IF NOT EXISTS idx_studio_booking_conflicts_client_id 
  ON public.studio_booking_conflicts(client_id);

CREATE INDEX IF NOT EXISTS idx_studio_booking_conflicts_status 
  ON public.studio_booking_conflicts(status);

CREATE INDEX IF NOT EXISTS idx_studio_booking_conflicts_resolved_by_id 
  ON public.studio_booking_conflicts(resolved_by_id);

CREATE INDEX IF NOT EXISTS idx_studio_booking_conflicts_created_booking_id 
  ON public.studio_booking_conflicts(created_booking_id);

CREATE INDEX IF NOT EXISTS idx_studio_booking_conflicts_attempted_date_time 
  ON public.studio_booking_conflicts(attempted_date_time);

-- 6. Row Level Security (RLS) Policy Adjustments for studio_booking_conflicts
-- Drop the legacy broad admin policy if it exists to confirm that only the "Super Admins can do everything on studio_booking_conflicts" policy from 00030 is active
DROP POLICY IF EXISTS "Admins can do everything on studio_booking_conflicts" ON public.studio_booking_conflicts;

-- Allow authenticated clients to select their own clashing attempts
DROP POLICY IF EXISTS "Clients can view their own studio booking conflicts" ON public.studio_booking_conflicts;
CREATE POLICY "Clients can view their own studio booking conflicts"
  ON public.studio_booking_conflicts FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
  );

-- 7. Row Level Security (RLS) Policy Adjustments for studio_bookings (override restriction)
-- Re-create client insert policy to reject override = true
DROP POLICY IF EXISTS "Clients can insert their own studio bookings" ON public.studio_bookings;
CREATE POLICY "Clients can insert their own studio bookings" 
  ON public.studio_bookings FOR INSERT TO authenticated 
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND NOT override
  );

-- Re-create client update policy to reject override = true
DROP POLICY IF EXISTS "Clients can update their own pending studio bookings" ON public.studio_bookings;
CREATE POLICY "Clients can update their own pending studio bookings" 
  ON public.studio_bookings FOR UPDATE TO authenticated 
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND status = 'PENDING'::public."BookingStatus"
  )
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND status IN ('PENDING'::public."BookingStatus", 'CANCELLED'::public."BookingStatus")
    AND NOT override
  );

-- Re-create admin management policy on studio_bookings to restrict override = true to SUPER_ADMIN only
DROP POLICY IF EXISTS "Admins can manage studio bookings" ON public.studio_bookings;
CREATE POLICY "Admins can manage studio bookings"
  ON public.studio_bookings FOR ALL TO authenticated
  USING (
    public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  )
  WITH CHECK (
    public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
    AND (NOT override OR public.current_user_role() = 'SUPER_ADMIN')
  );

COMMIT;
