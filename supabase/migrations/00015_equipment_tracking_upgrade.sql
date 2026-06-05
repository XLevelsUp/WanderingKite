-- ============================================================================
-- MIGRATION 00015: Equipment Tracking Upgrades
-- Adds Warranty, Bills, Costs, Ownership Type, and Date-Range Clash Detection
-- ============================================================================

-- 1. Add new fields to the `equipment` table
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS purchase_bill TEXT,
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS warranty_duration_months INTEGER,
ADD COLUMN IF NOT EXISTS warranty_expiration_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS service_cost DECIMAL(10,2) DEFAULT 0 CHECK (service_cost >= 0),
ADD COLUMN IF NOT EXISTS repair_cost DECIMAL(10,2) DEFAULT 0 CHECK (repair_cost >= 0),
ADD COLUMN IF NOT EXISTS ownership_type TEXT DEFAULT 'IN_HOUSE' CHECK (ownership_type IN ('IN_HOUSE', 'RENTAL'));

-- 2. Create Audit Logs for Assignment Clashes (Phase 4)
CREATE TABLE IF NOT EXISTS public.audit_clash_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    attempted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    attempted_start TIMESTAMPTZ NOT NULL,
    attempted_end TIMESTAMPTZ,
    conflict_with_assignment_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security — blocks all access by default
ALTER TABLE public.audit_clash_logs ENABLE ROW LEVEL SECURITY;

-- Only ADMIN and SUPER_ADMIN roles can view clash logs
CREATE POLICY "Admins can view clash logs"
  ON public.audit_clash_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- The trigger function runs as the DB (not as the user),
-- so it can always INSERT into this table regardless of RLS.
-- No INSERT policy needed for authenticated users.

-- 3. Phase 4 Date-Range Overlap Detection Trigger
-- We drop the strict unique index that prevented any two active assignments
-- and replace it with a date-range overlap check trigger.
DROP INDEX IF EXISTS public.uq_ea_equipment_active;

CREATE OR REPLACE FUNCTION check_equipment_assignment_clash()
RETURNS TRIGGER AS $$
DECLARE
  v_conflict_id UUID;
BEGIN
  -- We only care about active assignments
  IF NEW."returnedAt" IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Ensure we have an assignedAt
  IF NEW."assignedAt" IS NULL THEN
    NEW."assignedAt" := now();
  END IF;

  -- Check for any overlapping active assignment for the same equipment
  SELECT id INTO v_conflict_id
  FROM public.equipment_assignments
  WHERE "equipmentId" = NEW."equipmentId"
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND "returnedAt" IS NULL
    AND (
      NEW."assignedAt" < COALESCE("expectedReturn", 'infinity'::timestamptz)
      AND "assignedAt" < COALESCE(NEW."expectedReturn", 'infinity'::timestamptz)
    )
  LIMIT 1;

  IF FOUND THEN
    -- Log the clash attempt
    INSERT INTO public.audit_clash_logs (
      equipment_id,
      attempted_by,
      attempted_start,
      attempted_end,
      conflict_with_assignment_id
    ) VALUES (
      NEW."equipmentId",
      NEW."assignedBy",
      NEW."assignedAt",
      NEW."expectedReturn",
      v_conflict_id
    );

    -- Raise a 409-equivalent exception
    RAISE EXCEPTION 'EQUIPMENT_CLASH: Equipment % is already assigned during this period.', NEW."equipmentId"
      USING ERRCODE = 'unique_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_assignment_clash ON public.equipment_assignments;
CREATE TRIGGER trg_check_assignment_clash
  BEFORE INSERT OR UPDATE ON public.equipment_assignments
  FOR EACH ROW
  EXECUTE FUNCTION check_equipment_assignment_clash();
