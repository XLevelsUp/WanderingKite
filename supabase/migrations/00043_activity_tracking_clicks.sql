-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITY TRACKING — Phase 2: app-wide button click capture.
-- One row per captured click, appended by a global client-side listener
-- (label/path only, no free-text or form values). Append-only, high volume —
-- no UPDATE/DELETE policy. Only SUPER_ADMIN can read it.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
    label TEXT NOT NULL,
    path TEXT NOT NULL,
    element_tag TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_click_events_user ON public.click_events(user_id);
CREATE INDEX idx_click_events_created ON public.click_events(created_at DESC);
CREATE INDEX idx_click_events_label ON public.click_events(label);
CREATE INDEX idx_click_events_label_path ON public.click_events(label, path);

ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can view all click events"
ON public.click_events FOR SELECT
USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

CREATE POLICY "Users can insert own click events"
ON public.click_events FOR INSERT
WITH CHECK (auth.uid() = user_id);
