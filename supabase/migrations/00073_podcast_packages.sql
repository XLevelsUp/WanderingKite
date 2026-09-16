-- ═══════════════════════════════════════════════════════════════════════════
-- PODCAST PRICING — podcast_packages
--
-- Previously a hardcoded `podcastPackages` array in
-- apps/marketing/app/studiospace/page.tsx. Now admin-editable from
-- /studio-pricing, mirroring public.studio_packages (00061).
--
-- Differs from studio_packages in two ways:
--   * `features`   — the per-card checklist ("2 Cameras", "3 Lights & 1 Mic").
--                    Studio packages render a single description line instead.
--   * `is_popular` — the green "Most Popular" ribbon, the podcast column's
--                    equivalent of studio's `is_best_value`.
--
-- Same visibility rules as studio_packages: PUBLICLY READABLE, because
-- /studiospace is an anonymous marketing page and the client dashboard
-- authenticates via NextAuth rather than Supabase Auth, so neither caller
-- ever holds a Supabase session. Only writes are restricted to staff.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS public.podcast_packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  price           INTEGER NOT NULL CHECK (price >= 0),
  -- Nullable on purpose: these packages have no genuine "was" price today, and
  -- the strike-through / % OFF badge only renders when one is actually set.
  original_price  INTEGER CHECK (original_price IS NULL OR original_price >= 0),
  duration_label  TEXT NOT NULL DEFAULT 'Per Hour',
  description     TEXT NOT NULL DEFAULT '',
  features        TEXT[] NOT NULL DEFAULT '{}',
  is_popular      BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_updated_at ON public.podcast_packages;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.podcast_packages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS: public read, staff-only write
ALTER TABLE public.podcast_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view podcast packages" ON public.podcast_packages
  FOR SELECT USING (true);
CREATE POLICY "Admin+ can manage podcast packages" ON public.podcast_packages
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));
CREATE POLICY "Admin+ can update podcast packages" ON public.podcast_packages
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));
CREATE POLICY "Admin+ can delete podcast packages" ON public.podcast_packages
  FOR DELETE USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- Seed with the exact values the hardcoded array served, so switching from
-- hardcoded -> DB-driven changes nothing a visitor sees.
INSERT INTO public.podcast_packages
  (name, price, duration_label, description, features, is_popular, sort_order)
VALUES
  (
    'Single Cameraman', 1998, 'Per Hour',
    'One operator and one camera — ideal for solo episodes and interviews.',
    ARRAY[
      'Studio space rent included (₹999)',
      '1 Cameraman (₹999)',
      '1 Camera',
      '3 Lights & 1 Mic'
    ],
    false, 1
  ),
  (
    'Double Cameraman', 2997, 'Per Hour',
    'Two angles covered live — the standard setup for guest conversations.',
    ARRAY[
      'Studio space rent included (₹999)',
      '2 Cameramen (₹999 each)',
      '2 Cameras',
      '3 Lights & 1 Mic'
    ],
    true, 2
  ),
  (
    'Triple Cameraman', 3996, 'Per Hour',
    'Full multi-cam coverage for panels and high-production episodes.',
    ARRAY[
      'Studio space rent included (₹999)',
      '3 Cameramen (₹999 each)',
      '3 Cameras',
      '3 Lights & 1 Mic'
    ],
    false, 3
  );

COMMIT;
