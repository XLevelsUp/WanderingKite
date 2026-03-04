-- =============================================================================
-- Migration: 00006_service_taxonomy.sql
-- =============================================================================
-- Purpose:
--   1. Create the `service_type` ENUM covering all taxonomy slugs.
--   2. Add `service_type` column to `equipment` (nullable — existing rows unset).
--   3. Create `inventory_allocation` table for Smart Allocation kit mappings.
--   4. Add `service_type` FK column to `assignments` (field operations).
--   5. Create index helpers for common lookup patterns.
--
-- Safe to run against existing data — all new columns are nullable / have
-- DEFAULT values so no existing rows are broken.
-- =============================================================================

BEGIN;

-- ── 1. service_type ENUM ──────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.service_type AS ENUM (
    -- Photography → Events
    'wedding',
    'engagement',
    'birthday',
    -- Photography → Portraits
    'family',
    'maternity',
    'baby_shoot',
    -- Corporate
    'product',
    'cinematic_video',
    'social_media',
    'model_shoot',
    'headshot',
    -- Commercial
    'ads',
    'music_video',
    'short_film',
    -- Studio Facilities
    'podcast',
    'equipment_rental',
    'space_allocation'
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'service_type ENUM already exists — skipping creation.';
END $$;

-- ── 2. Add service_type to equipment ─────────────────────────────────────────
--  Allows the rentals / bookings UI to know which service an item is optimised
--  for (e.g. a cinema body vs a portrait prime).

ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS service_type public.service_type;

COMMENT ON COLUMN public.equipment.service_type IS
  'Optional preferred service type for Smart Allocation suggestions.';

-- ── 3. inventory_allocation table ────────────────────────────────────────────
--  Tracks which equipment items are recommended (or locked) per service type.
--  The Smart Allocation server action reads this at runtime.

CREATE TABLE IF NOT EXISTS public.inventory_allocation (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type    public.service_type NOT NULL,
  equipment_id    UUID NOT NULL
                    REFERENCES public.equipment(id) ON DELETE CASCADE,
  priority        SMALLINT NOT NULL DEFAULT 1
                    CHECK (priority BETWEEN 1 AND 10),
  -- 1 = always suggest, 2 = optional, etc.
  allocation_type TEXT NOT NULL DEFAULT 'suggested'
                    CHECK (allocation_type IN ('required', 'suggested', 'optional')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A given piece of equipment should only appear once per service type slot
  UNIQUE (service_type, equipment_id)
);

COMMENT ON TABLE public.inventory_allocation IS
  'Maps equipment items to service types for Smart Allocation auto-suggestion.';

-- ── 4. Add service_type to equipment_assignments ─────────────────────────────────
--  Lets field-ops queries filter deployments by which service category owns
--  the gear in that deployment.

ALTER TABLE public.equipment_assignments
  ADD COLUMN IF NOT EXISTS service_type public.service_type;

COMMENT ON COLUMN public.equipment_assignments.service_type IS
  'Service category the deployed equipment is supporting.';

-- ── 5. Indexes ────────────────────────────────────────────────────────────────

-- Fast lookup: all available equipment for a given service type
CREATE INDEX IF NOT EXISTS idx_equipment_service_type
  ON public.equipment (service_type)
  WHERE service_type IS NOT NULL;

-- Fast lookup: allocation plan for a service type (sorted by priority)
CREATE INDEX IF NOT EXISTS idx_inventory_allocation_service_type
  ON public.inventory_allocation (service_type, priority);

-- Fast lookup: active assignments by service type
CREATE INDEX IF NOT EXISTS idx_ea_service_type
  ON public.equipment_assignments (service_type)
  WHERE service_type IS NOT NULL;

-- ── 6. updated_at trigger for inventory_allocation ────────────────────────────

-- Reuse the existing handle_updated_at() function from prior migrations
DROP TRIGGER IF EXISTS trg_inventory_allocation_updated_at
  ON public.inventory_allocation;

CREATE TRIGGER trg_inventory_allocation_updated_at
  BEFORE UPDATE ON public.inventory_allocation
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 7. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.inventory_allocation ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read allocation suggestions
CREATE POLICY "Allow authenticated read on inventory_allocation"
  ON public.inventory_allocation
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins / super_admins may insert / update / delete allocation records
CREATE POLICY "Allow admin write on inventory_allocation"
  ON public.inventory_allocation
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ── 8. Seed initial allocation suggestions ────────────────────────────────────
-- Populate a small reference seed for music_video (HSS + Gimbal) so the
-- requirement is enforced at the DB level as well as the Zod layer.
-- NOTE: These are name-based lookups — run only when equipment rows exist.

INSERT INTO public.inventory_allocation (service_type, equipment_id, priority, allocation_type, notes)
SELECT
  'music_video'::public.service_type,
  e.id,
  1,
  'required',
  'Cinema kit mandatory for Music Video productions'
FROM public.equipment e
WHERE e.name ILIKE '%FX3%'   -- Sony FX3 cinema body
   OR e.name ILIKE '%Gimbal%'
ON CONFLICT (service_type, equipment_id) DO NOTHING;

INSERT INTO public.inventory_allocation (service_type, equipment_id, priority, allocation_type, notes)
SELECT
  'music_video'::public.service_type,
  e.id,
  2,
  'required',
  'HSS-capable flash required for Music Video'
FROM public.equipment e
WHERE e.name ILIKE '%Godox V1%'
ON CONFLICT (service_type, equipment_id) DO NOTHING;

COMMIT;
