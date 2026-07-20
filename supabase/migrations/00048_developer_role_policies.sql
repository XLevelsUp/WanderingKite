-- ═══════════════════════════════════════════════════════════════════════════
-- DEVELOPER ROLE — Part 2a: fix current_user_role() + policies that depend on it
--
-- Requires 00047_developer_role.sql to have already been committed (adds the
-- 'DEVELOPER' enum value this migration references throughout).
--
-- Self-contained and idempotent: safe to run on its own, and safe to re-run
-- if it partially failed before. Do NOT rely on 00048b having run first, or
-- vice versa — each file drops immediately before it creates.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- =============================================================================
-- 1. Drop every policy that calls current_user_role(), so nothing depends on
--    its old return type when we drop/recreate the function below. Postgres
--    refuses to CREATE OR REPLACE a function with a different return type,
--    and refuses to DROP FUNCTION while a policy still references it.
-- =============================================================================

DROP POLICY IF EXISTS "ADMIN can manage equipment" ON public.equipment;
DROP POLICY IF EXISTS "ADMIN can manage branches" ON public.branches;
DROP POLICY IF EXISTS "ADMIN can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Clients can view their own ID proof" ON public.client_id_proofs;
DROP POLICY IF EXISTS "Clients can view their own photography bookings" ON public.photography_bookings;
DROP POLICY IF EXISTS "Clients can view their own rentals" ON public.rental_bookings;
DROP POLICY IF EXISTS "Clients can view their own studio bookings" ON public.studio_bookings;
DROP POLICY IF EXISTS "Users can view album details linked to accessible bookings" ON public.album_details;
DROP POLICY IF EXISTS "Clients can view their own rental equipment links" ON public."_RentalBookingToEquipment";
DROP POLICY IF EXISTS "Clients can view their own studio equipment links" ON public."_StudioBookingToEquipment";
DROP POLICY IF EXISTS "Admins can manage all dashboard tables" ON public.client_id_proofs;
DROP POLICY IF EXISTS "Admins can manage rental bookings" ON public.rental_bookings;
DROP POLICY IF EXISTS "Admins can manage rental bookings join links" ON public."_RentalBookingToEquipment";
DROP POLICY IF EXISTS "Admins can manage studio bookings join links" ON public."_StudioBookingToEquipment";
DROP POLICY IF EXISTS "Admins can manage photography bookings" ON public.photography_bookings;
DROP POLICY IF EXISTS "Admins can manage albums" ON public.album_details;
DROP POLICY IF EXISTS "Admins can manage studio bookings" ON public.studio_bookings;

-- =============================================================================
-- 2. Fix current_user_role(): it was declared against the legacy lowercase
--    `user_role` enum ('SUPER_ADMIN','ADMIN','STAFF'), not the live
--    "UserRole" enum profiles.role actually uses (see migration 00026's own
--    comment acknowledging this). It happened to work only because the
--    SUPER_ADMIN/ADMIN labels are shared between both enums — DEVELOPER only
--    exists in "UserRole", so this must be fixed now or every call to it
--    referencing DEVELOPER would error. Postgres refuses to CREATE OR REPLACE
--    a function with a different return type — DROP FUNCTION first (safe
--    now that no policy depends on it, per step 1 above).
-- =============================================================================

DROP FUNCTION IF EXISTS public.current_user_role();

CREATE FUNCTION public.current_user_role()
RETURNS "UserRole" AS $$
DECLARE
  v_role "UserRole";
  v_setting TEXT;
BEGIN
  v_setting := current_setting('app.current_user_role', true);
  IF v_setting IS NOT NULL AND v_setting <> '' THEN
    RETURN v_setting::"UserRole";
  END IF;
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  PERFORM set_config('app.current_user_role', v_role::text, true);
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE SET search_path = public, pg_temp;

-- get_user_role(uuid) already returns "UserRole" (fixed in migration 00003),
-- so it needs no type change — only the policies recreated below (and in
-- 00048b) that call it.

-- =============================================================================
-- 3. Recreate the policies dropped in step 1, explicitly adding DEVELOPER.
--    Each block is that policy's CURRENT (last-defined) form — not a diff,
--    since every earlier version has already been superseded by a later
--    migration.
-- =============================================================================

-- ── equipment ─────────────────────────────────────────────────────────────
CREATE POLICY "ADMIN can manage equipment" ON public.equipment FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- ── branches ──────────────────────────────────────────────────────────────
CREATE POLICY "ADMIN can manage branches" ON public.branches FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- ── categories ────────────────────────────────────────────────────────────
CREATE POLICY "ADMIN can manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- ── client_id_proofs / photography_bookings / rental_bookings /
--    studio_bookings / album_details (client SELECT policies with an
--    ADMIN/SUPER_ADMIN OR-clause) ────────────────────────────────────────────
CREATE POLICY "Clients can view their own ID proof"
  ON public.client_id_proofs FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  );

CREATE POLICY "Clients can view their own photography bookings"
  ON public.photography_bookings FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  );

CREATE POLICY "Clients can view their own rentals"
  ON public.rental_bookings FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  );

CREATE POLICY "Clients can view their own studio bookings"
  ON public.studio_bookings FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  );

CREATE POLICY "Users can view album details linked to accessible bookings"
  ON public.album_details FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.photography_bookings b
      WHERE b.id = booking_id
      AND (
        b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
        OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
      )
    )
  );

-- ── _RentalBookingToEquipment / _StudioBookingToEquipment (client view +
--    admin-manage join-table policies) ──────────────────────────────────────
CREATE POLICY "Clients can view their own rental equipment links"
  ON public."_RentalBookingToEquipment" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_bookings b
      WHERE b.id = "B"
      AND (
        b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
        OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
      )
    )
  );

CREATE POLICY "Clients can view their own studio equipment links"
  ON public."_StudioBookingToEquipment" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.studio_bookings b
      WHERE b.id = "B"
      AND (
        b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
        OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
      )
    )
  );

CREATE POLICY "Admins can manage all dashboard tables"
  ON public.client_id_proofs FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

CREATE POLICY "Admins can manage rental bookings"
  ON public.rental_bookings FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

CREATE POLICY "Admins can manage rental bookings join links"
  ON public."_RentalBookingToEquipment" FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

CREATE POLICY "Admins can manage studio bookings join links"
  ON public."_StudioBookingToEquipment" FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

CREATE POLICY "Admins can manage photography bookings"
  ON public.photography_bookings FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

CREATE POLICY "Admins can manage albums"
  ON public.album_details FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- ── studio_bookings admin-manage (final form, redefined in 00031 to gate
--    override=true) — DEVELOPER gets the same override privilege SUPER_ADMIN
--    has, consistent with "no restrictions" ───────────────────────────────
CREATE POLICY "Admins can manage studio bookings"
  ON public.studio_bookings FOR ALL TO authenticated
  USING (
    public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
  WITH CHECK (
    public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
    AND (NOT override OR public.current_user_role() IN ('SUPER_ADMIN', 'DEVELOPER'))
  );

COMMIT;
