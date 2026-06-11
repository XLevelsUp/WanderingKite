-- =============================================================================
-- Migration: 00027_client_dashboard_phase_2_policies_admin_triggers.sql (Part 4: Admin Policies & Timestamp Triggers)
-- =============================================================================
-- Purpose:
--   1. Add RLS policies for join tables (checking auth_user_id strictly).
--   2. Add RLS policies for admins (with WITH CHECK) for new and legacy tables.
--   3. Setup updated_at triggers (including many-to-many join tables).
-- =============================================================================

BEGIN;

-- =============================================================================
-- Row Level Security (RLS) Policies on Many-to-Many Join Tables
-- =============================================================================

-- _RentalBookingToEquipment
-- Prisma column layout (alphabetical by model name):
--   "A" = equipment.id  (Equipment < RentalBooking)
--   "B" = rental_bookings.id
DROP POLICY IF EXISTS "Clients can view their own rental equipment links" ON public."_RentalBookingToEquipment";
CREATE POLICY "Clients can view their own rental equipment links"
  ON public."_RentalBookingToEquipment" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_bookings b
      WHERE b.id = "B"
      AND (
        b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
        OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
      )
    )
  );

DROP POLICY IF EXISTS "Clients can insert their own rental equipment links" ON public."_RentalBookingToEquipment";
CREATE POLICY "Clients can insert their own rental equipment links"
  ON public."_RentalBookingToEquipment" FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rental_bookings b
      WHERE b.id = "B"
      AND b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can delete their own rental equipment links for pending bookings" ON public."_RentalBookingToEquipment";
CREATE POLICY "Clients can delete their own rental equipment links for pending bookings"
  ON public."_RentalBookingToEquipment" FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_bookings b
      WHERE b.id = "B"
      AND b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
      AND b.status = 'PENDING'::public."RentalStatus"
    )
  );

-- _StudioBookingToEquipment
-- Prisma column layout (alphabetical by model name):
--   "A" = equipment.id  (Equipment < StudioBooking)
--   "B" = studio_bookings.id
DROP POLICY IF EXISTS "Clients can view their own studio equipment links" ON public."_StudioBookingToEquipment";
CREATE POLICY "Clients can view their own studio equipment links"
  ON public."_StudioBookingToEquipment" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.studio_bookings b
      WHERE b.id = "B"
      AND (
        b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
        OR public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
      )
    )
  );

DROP POLICY IF EXISTS "Clients can insert their own studio equipment links" ON public."_StudioBookingToEquipment";
CREATE POLICY "Clients can insert their own studio equipment links"
  ON public."_StudioBookingToEquipment" FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.studio_bookings b
      WHERE b.id = "B"
      AND b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can delete their own studio equipment links for pending bookings" ON public."_StudioBookingToEquipment";
CREATE POLICY "Clients can delete their own studio equipment links for pending bookings"
  ON public."_StudioBookingToEquipment" FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.studio_bookings b
      WHERE b.id = "B"
      AND b.client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
      AND b.status = 'PENDING'::public."BookingStatus"
    )
  );


-- =============================================================================
-- Admins RLS Management Policies (with WITH CHECK)
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all dashboard tables" ON public.client_id_proofs;
CREATE POLICY "Admins can manage all dashboard tables"
  ON public.client_id_proofs FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Admins can manage rental bookings" ON public.rental_bookings;
CREATE POLICY "Admins can manage rental bookings"
  ON public.rental_bookings FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Admins can manage rental bookings join links" ON public."_RentalBookingToEquipment";
CREATE POLICY "Admins can manage rental bookings join links"
  ON public."_RentalBookingToEquipment" FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Admins can manage studio bookings" ON public.studio_bookings;
CREATE POLICY "Admins can manage studio bookings"
  ON public.studio_bookings FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Admins can manage studio bookings join links" ON public."_StudioBookingToEquipment";
CREATE POLICY "Admins can manage studio bookings join links"
  ON public."_StudioBookingToEquipment" FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Admins can manage photography bookings" ON public.photography_bookings;
CREATE POLICY "Admins can manage photography bookings"
  ON public.photography_bookings FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- INFO: album insert is intentionally admin-only
DROP POLICY IF EXISTS "Admins can manage albums" ON public.album_details;
CREATE POLICY "Admins can manage albums"
  ON public.album_details FOR ALL TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));


-- =============================================================================
-- Idempotent safeguards for modifying admin policies on earlier tables
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'equipment') THEN
    DROP POLICY IF EXISTS "ADMIN can manage equipment" ON public.equipment;
    CREATE POLICY "ADMIN can manage equipment" ON public.equipment FOR ALL TO authenticated
      USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
      WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'branches') THEN
    DROP POLICY IF EXISTS "ADMIN can manage branches" ON public.branches;
    CREATE POLICY "ADMIN can manage branches" ON public.branches FOR ALL TO authenticated
      USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
      WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    DROP POLICY IF EXISTS "ADMIN can manage categories" ON public.categories;
    CREATE POLICY "ADMIN can manage categories" ON public.categories FOR ALL TO authenticated
      USING (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
      WITH CHECK (public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
  END IF;
END $$;


-- =============================================================================
-- Timestamps Triggers
-- =============================================================================
-- NOTE: Prisma implicit many-to-many join tables (_RentalBookingToEquipment,
-- _StudioBookingToEquipment) only have "A" and "B" columns — NO updated_at column.
-- Adding updated_at triggers to them would cause a runtime error. They are
-- insert/delete-only tables; UPDATE never occurs on them. Triggers omitted.

DROP TRIGGER IF EXISTS trg_client_id_proofs_updated_at ON public.client_id_proofs;
CREATE TRIGGER trg_client_id_proofs_updated_at
  BEFORE UPDATE ON public.client_id_proofs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_rental_bookings_updated_at ON public.rental_bookings;
CREATE TRIGGER trg_rental_bookings_updated_at
  BEFORE UPDATE ON public.rental_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_studio_bookings_updated_at ON public.studio_bookings;
CREATE TRIGGER trg_studio_bookings_updated_at
  BEFORE UPDATE ON public.studio_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_photography_bookings_updated_at ON public.photography_bookings;
CREATE TRIGGER trg_photography_bookings_updated_at
  BEFORE UPDATE ON public.photography_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_album_details_updated_at ON public.album_details;
CREATE TRIGGER trg_album_details_updated_at
  BEFORE UPDATE ON public.album_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMIT;
