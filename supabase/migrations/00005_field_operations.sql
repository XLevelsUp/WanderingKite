-- ============================================================================
-- FIELD OPERATIONS MIGRATION v5 — Equipment Assignments (Triad View)
-- Additive, Non-Breaking. Safe to re-run (fully idempotent).
-- Adds: assignment_status enum, equipment_assignments join table, RLS policies
-- ============================================================================

-- ============================================================================
-- STAGE 1: ENUM — Assignment lifecycle status
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.assignment_status AS ENUM ('in_field', 'returned', 'maintenance');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- STAGE 2: TABLE — equipment_assignments (Triad: Employee ↔ Equipment ↔ Client)
-- ============================================================================
--
-- Each row records one deployment event:
--   - which employee holds the gear       (employeeId → profiles)
--   - which piece of equipment            (equipmentId → equipment)
--   - which client/project location       (clientId → clients)
--
-- Active assignments have "returnedAt" IS NULL.
-- A unique partial index prevents double-active-assignment on the same gear.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.equipment_assignments (
  id               UUID                       PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId"     UUID                       NOT NULL REFERENCES public.profiles(id)  ON DELETE RESTRICT,
  "equipmentId"    UUID                       NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
  "clientId"       UUID                       REFERENCES public.clients(id)            ON DELETE SET NULL,
  status           public.assignment_status   NOT NULL DEFAULT 'in_field',
  location         TEXT,
  notes            TEXT,
  "assignedAt"     TIMESTAMPTZ                NOT NULL DEFAULT now(),
  "expectedReturn" TIMESTAMPTZ,
  "returnedAt"     TIMESTAMPTZ,
  "assignedBy"     UUID                       REFERENCES public.profiles(id)           ON DELETE SET NULL,
  "createdAt"      TIMESTAMPTZ                NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ                NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------
-- Indexes: optimised for the three most common query patterns
-- -----------------------------------------------------------------------

-- 1. Primary dashboard query: all active (un-returned) assignments
CREATE INDEX IF NOT EXISTS idx_ea_active
  ON public.equipment_assignments("employeeId")
  WHERE "returnedAt" IS NULL;

-- 2. Foreign key traversal: gear → assignments
CREATE INDEX IF NOT EXISTS idx_ea_equipment
  ON public.equipment_assignments("equipmentId");

-- 3. Client linkage queries
CREATE INDEX IF NOT EXISTS idx_ea_client
  ON public.equipment_assignments("clientId");

-- 4. Guard: only one active assignment per piece of equipment at a time
--    (mirrors the uq_equipment_active_assignment constraint on assignment_history)
CREATE UNIQUE INDEX IF NOT EXISTS uq_ea_equipment_active
  ON public.equipment_assignments("equipmentId")
  WHERE "returnedAt" IS NULL;

-- -----------------------------------------------------------------------
-- updated_at auto-maintenance trigger
-- -----------------------------------------------------------------------

CREATE TRIGGER set_ea_updated_at
  BEFORE UPDATE ON public.equipment_assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- STAGE 3: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;

-- Admins see all assignments; employees see only their own
DROP POLICY IF EXISTS "Admins view all assignments" ON public.equipment_assignments;
CREATE POLICY "Admins view all assignments"
  ON public.equipment_assignments FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
    OR "employeeId" = auth.uid()
  );

-- Only admins can create assignments
DROP POLICY IF EXISTS "Admins can insert assignments" ON public.equipment_assignments;
CREATE POLICY "Admins can insert assignments"
  ON public.equipment_assignments FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Only admins can update (e.g. quick-return)
DROP POLICY IF EXISTS "Admins can update assignments" ON public.equipment_assignments;
CREATE POLICY "Admins can update assignments"
  ON public.equipment_assignments FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Only super-admins can hard-delete
DROP POLICY IF EXISTS "Super admins can delete assignments" ON public.equipment_assignments;
CREATE POLICY "Super admins can delete assignments"
  ON public.equipment_assignments FOR DELETE
  USING (
    public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
  );


-- ============================================================================
-- DONE
-- ============================================================================
-- Summary:
--   + assignment_status enum (in_field | returned | maintenance)
--   + equipment_assignments table: Employee ↔ Equipment ↔ Client triad
--   + Partial unique index: one active assignment per equipment at a time
--   + 3 composite/partial indexes for production query patterns
--   + RLS: Admins see all; employees see their own row only
-- ============================================================================
