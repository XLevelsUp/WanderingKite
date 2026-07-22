-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — assignment/status history.
-- media_records.status / assigned_employee_id are still the "current value"
-- columns, but nothing recorded who had a shoot before, when it changed
-- hands, or how long it sat in each stage. This table captures every
-- transition (from -> to, for both fields together) so an "Editor Tracker"
-- page can show a real history, not just a snapshot.
-- Written only by actions/media-tracker.ts's updateAssignment() — the sole
-- function allowed to change status/assigned_employee_id going forward.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.media_assignment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_record_id UUID NOT NULL REFERENCES public.media_records(id) ON DELETE CASCADE,
    from_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    to_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX media_assignment_history_record_idx ON public.media_assignment_history(media_record_id);

ALTER TABLE public.media_assignment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view assignment history"
ON public.media_assignment_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);

CREATE POLICY "Admins can insert assignment history"
ON public.media_assignment_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER')
  )
);
