-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITY TRACKING — Phase 1: login/session tracking.
-- One row per real login (deduped client-side via sessionStorage). Duration
-- for both clean sign-outs and abandoned tabs is computed at query time as
-- coalesce(logout_at, last_active_at) - login_at — no cron job needed.
-- Only SUPER_ADMIN can read this table; each user can only touch their own
-- session row (enforced via SECURITY DEFINER RPCs, no blanket UPDATE policy).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_at ON public.user_sessions(login_at DESC);
CREATE INDEX idx_user_sessions_open ON public.user_sessions(user_id) WHERE logout_at IS NULL;

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can view all sessions"
ON public.user_sessions FOR SELECT
USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

CREATE POLICY "Users can insert own session"
ON public.user_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- No UPDATE policy for regular users — mutation only via the RPCs below,
-- which internally re-check auth.uid() = user_id so a user can only ever
-- touch their own open session.

CREATE OR REPLACE FUNCTION public.heartbeat_session(p_session_id UUID)
RETURNS VOID AS $$
  UPDATE public.user_sessions
  SET last_active_at = NOW()
  WHERE id = p_session_id AND user_id = auth.uid() AND logout_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.close_session(p_session_id UUID)
RETURNS VOID AS $$
  UPDATE public.user_sessions
  SET logout_at = NOW(), last_active_at = NOW()
  WHERE id = p_session_id AND user_id = auth.uid() AND logout_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;
