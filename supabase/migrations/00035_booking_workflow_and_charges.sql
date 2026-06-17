-- ============================================================================
-- Phase 4 Workflow & Charges Migration
-- ============================================================================

-- 1. Add new enum values to BookingStatus
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'BookingStatus' AND e.enumlabel = 'IN_EDITING') THEN
    ALTER TYPE public."BookingStatus" ADD VALUE 'IN_EDITING';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'BookingStatus' AND e.enumlabel = 'HANDED_OVER') THEN
    ALTER TYPE public."BookingStatus" ADD VALUE 'HANDED_OVER';
  END IF;
END $$;

-- 2. Add delivery link and timestamps to studio_bookings
ALTER TABLE public.studio_bookings 
  ADD COLUMN IF NOT EXISTS delivery_link TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS in_editing_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS handed_over_at TIMESTAMPTZ;

-- 3. Add delivery link and timestamps to photography_bookings
ALTER TABLE public.photography_bookings 
  ADD COLUMN IF NOT EXISTS delivery_link TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS in_editing_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS handed_over_at TIMESTAMPTZ;

-- 4. Create studio_booking_charges table (Only for Studio Bookings as requested)
CREATE TABLE IF NOT EXISTS public.studio_booking_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.studio_bookings(id) ON DELETE CASCADE,
  charge_type TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.studio_booking_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view charges" ON public.studio_booking_charges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Super Admins can manage charges" ON public.studio_booking_charges FOR ALL USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- 5. Create booking_assignees table
CREATE TABLE IF NOT EXISTS public.booking_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_booking_id UUID REFERENCES public.studio_bookings(id) ON DELETE CASCADE,
  photography_booking_id UUID REFERENCES public.photography_bookings(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (
    (studio_booking_id IS NOT NULL AND photography_booking_id IS NULL) OR
    (studio_booking_id IS NULL AND photography_booking_id IS NOT NULL)
  )
);
ALTER TABLE public.booking_assignees ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_assignees_studio ON public.booking_assignees(studio_booking_id);
CREATE INDEX idx_assignees_photo ON public.booking_assignees(photography_booking_id);

CREATE POLICY "Authenticated users can view assignees" ON public.booking_assignees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Super Admins can manage assignees" ON public.booking_assignees FOR ALL USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');
