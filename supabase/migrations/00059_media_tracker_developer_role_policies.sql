-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — add DEVELOPER to the RLS policies on storage_devices and
-- media_records.
-- These two tables were created in 00039_media_tracker.sql BEFORE the
-- DEVELOPER role existed (added later in 00047_developer_role.sql). When
-- DEVELOPER was rolled out across the rest of the app's RLS policies
-- (00048_developer_role_policies.sql, 00048b_developer_role_policies_recreate.sql),
-- these two tables were missed — so a DEVELOPER-role account querying either
-- table through the normal (RLS-bound) client got zero rows back, even
-- though the underlying data was completely intact. This was silently
-- indistinguishable from "no data" in the UI (no error, just an empty list).
-- Idempotent: every CREATE POLICY is preceded by its own DROP POLICY IF
-- EXISTS, so re-running this migration is always safe.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── storage_devices ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view storage devices" ON public.storage_devices;
CREATE POLICY "Staff can view storage devices"
ON public.storage_devices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);

DROP POLICY IF EXISTS "Admins can insert storage devices" ON public.storage_devices;
CREATE POLICY "Admins can insert storage devices"
ON public.storage_devices FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);

DROP POLICY IF EXISTS "Admins can update storage devices" ON public.storage_devices;
CREATE POLICY "Admins can update storage devices"
ON public.storage_devices FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);

-- ── media_records ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view media records" ON public.media_records;
CREATE POLICY "Staff can view media records"
ON public.media_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);

DROP POLICY IF EXISTS "Admins can insert media records" ON public.media_records;
CREATE POLICY "Admins can insert media records"
ON public.media_records FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);

DROP POLICY IF EXISTS "Admins can update media records" ON public.media_records;
CREATE POLICY "Admins can update media records"
ON public.media_records FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);

DROP POLICY IF EXISTS "Admins can delete media records" ON public.media_records;
CREATE POLICY "Admins can delete media records"
ON public.media_records FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);

COMMIT;
