-- Migration: 00030_studio_booking_conflicts.sql
-- Purpose: Add studio_booking_conflicts table to track and audit booking clashes.

BEGIN;

-- Ensure pgcrypto extension is available for uuid generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.studio_booking_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, -- Preserve audit history if client is deleted
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  attempted_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  attempted_duration_hours INT NOT NULL CHECK (attempted_duration_hours > 0), -- Ensure duration is positive
  attempted_purpose TEXT NOT NULL,
  attempted_equipment_ids JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(attempted_equipment_ids) = 'array'), -- Validate as JSON array
  conflicting_booking_id UUID REFERENCES public.studio_bookings(id) ON DELETE SET NULL,
  conflicting_booking_details JSONB, -- JSON snapshot of the conflicting booking details (occupant name, timing, purpose)
  status VARCHAR(50) NOT NULL DEFAULT 'blocked' CHECK (status IN ('blocked', 'approved', 'rejected')), -- Enforce allowed statuses
  resolved_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.studio_booking_conflicts ENABLE ROW LEVEL SECURITY;

-- Setup policy: Super Admins can do everything
CREATE POLICY "Super Admins can do everything on studio_booking_conflicts"
  ON public.studio_booking_conflicts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
  );

-- Trigger to handle updated_at field updates
DROP TRIGGER IF EXISTS trg_studio_booking_conflicts_updated_at ON public.studio_booking_conflicts;
CREATE TRIGGER trg_studio_booking_conflicts_updated_at
  BEFORE UPDATE ON public.studio_booking_conflicts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMIT;
