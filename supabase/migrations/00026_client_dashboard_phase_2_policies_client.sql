-- =============================================================================
-- Migration: 00026_client_dashboard_phase_2_policies_client.sql (Part 3: Client Policies)
-- =============================================================================
-- Purpose:
--   1. Optimize role check evaluations using a session-local cached function.
--   2. Add RLS policies for clients (checking auth_user_id strictly).
--   3. Add client update and delete policies for pending bookings, permitting transitions to CANCELLED.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Optimize helper current_user_role() function (caches via session GUC setting)
-- Note: We mark this function as VOLATILE because calling set_config has session-level
-- side effects, which deviates from STABLE semantics in PG. GUC caching will still
-- prevent redundant select queries within the same session/transaction.
-- Note on pgBouncer: This cache persists across transactions in the same session. 
-- In session-pooling mode, role changes mid-session won't show immediately until
-- the connection is re-established or the GUC parameter is cleared.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
  v_setting TEXT;
BEGIN
  v_setting := current_setting('app.current_user_role', true);
  IF v_setting IS NOT NULL AND v_setting <> '' THEN
    RETURN v_setting::user_role;
  END IF;
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  PERFORM set_config('app.current_user_role', v_role::text, true);
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE SET search_path = public, pg_temp;


-- NOTE: get_user_role(uuid) is intentionally NOT redefined here.
-- It is still used by ~30 existing RLS policies across the schema (profiles, equipment,
-- attendance_logs, payroll_records, etc.). Dropping or replacing it would either:
--   a) Fail with 42P13 if the return type changed, or
--   b) Fail with 2BP01 if we try DROP first (dependent objects block it).
-- All NEW policies in this migration use current_user_role() instead.
-- If get_user_role() needs updating, do it in a separate migration that also
-- rebuilds all dependent policies atomically.


-- =============================================================================
-- Row Level Security (RLS) & Policies
-- =============================================================================

-- Client policies (checking auth_user_id strictly, removing email fallback)

-- 1. client_id_proofs
DROP POLICY IF EXISTS "Clients can view their own ID proof" ON public.client_id_proofs;
CREATE POLICY "Clients can view their own ID proof" 
  ON public.client_id_proofs FOR SELECT TO authenticated 
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Clients can insert their own ID proof" ON public.client_id_proofs;
CREATE POLICY "Clients can insert their own ID proof" 
  ON public.client_id_proofs FOR INSERT TO authenticated 
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Clients can update their own ID proof" ON public.client_id_proofs;
CREATE POLICY "Clients can update their own ID proof" 
  ON public.client_id_proofs FOR UPDATE TO authenticated 
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND status IN ('PENDING'::public."IdProofStatus", 'REJECTED'::public."IdProofStatus")
  )
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND status IN ('PENDING'::public."IdProofStatus", 'REJECTED'::public."IdProofStatus")
  );


-- 2. photography_bookings
DROP POLICY IF EXISTS "Clients can view their own photography bookings" ON public.photography_bookings;
CREATE POLICY "Clients can view their own photography bookings" 
  ON public.photography_bookings FOR SELECT TO authenticated 
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Clients can insert their own photography bookings" ON public.photography_bookings;
CREATE POLICY "Clients can insert their own photography bookings" 
  ON public.photography_bookings FOR INSERT TO authenticated 
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Clients can update their own pending photography bookings" ON public.photography_bookings;
CREATE POLICY "Clients can update their own pending photography bookings" 
  ON public.photography_bookings FOR UPDATE TO authenticated 
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND status = 'PENDING'::public."BookingStatus"
  )
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND status IN ('PENDING'::public."BookingStatus", 'CANCELLED'::public."BookingStatus")
  );


-- 3. rental_bookings
DROP POLICY IF EXISTS "Clients can view their own rentals" ON public.rental_bookings;
CREATE POLICY "Clients can view their own rentals" 
  ON public.rental_bookings FOR SELECT TO authenticated 
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Clients can insert their own rentals" ON public.rental_bookings;
CREATE POLICY "Clients can insert their own rentals" 
  ON public.rental_bookings FOR INSERT TO authenticated 
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Clients can update their own pending rentals" ON public.rental_bookings;
CREATE POLICY "Clients can update their own pending rentals" 
  ON public.rental_bookings FOR UPDATE TO authenticated 
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND status = 'PENDING'::public."RentalStatus"
  )
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    AND status IN ('PENDING'::public."RentalStatus", 'CANCELLED'::public."RentalStatus")
  );


-- 4. studio_bookings
DROP POLICY IF EXISTS "Clients can view their own studio bookings" ON public.studio_bookings;
CREATE POLICY "Clients can view their own studio bookings" 
  ON public.studio_bookings FOR SELECT TO authenticated 
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Clients can insert their own studio bookings" ON public.studio_bookings;
CREATE POLICY "Clients can insert their own studio bookings" 
  ON public.studio_bookings FOR INSERT TO authenticated 
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
  );

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
  );


-- 5. album_details
DROP POLICY IF EXISTS "Users can view album details linked to accessible bookings" ON public.album_details;
CREATE POLICY "Users can view album details linked to accessible bookings" 
  ON public.album_details FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.photography_bookings b 
      WHERE b.id = booking_id 
      AND (
        b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
        OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
      )
    )
  );

COMMIT;
