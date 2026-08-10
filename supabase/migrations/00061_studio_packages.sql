-- ═══════════════════════════════════════════════════════════════════════════
-- STUDIO PRICING — studio_packages + studio_add_ons
--
-- Previously hardcoded JS constants duplicated in
-- components/studio/StudioPricingEngine.tsx and
-- components/client-dashboard/StudioTab.tsx. Now a real, admin-editable
-- source of truth for both.
--
-- These are PUBLICLY READABLE: /studiospace is an anonymous marketing page,
-- and the client dashboard authenticates via NextAuth (not Supabase Auth),
-- so neither caller ever holds a Supabase session. Only writes are
-- restricted to staff.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS public.studio_packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  price           INTEGER NOT NULL CHECK (price >= 0),
  original_price  INTEGER NOT NULL CHECK (original_price >= 0),
  duration_label  TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  is_best_value   BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.studio_add_ons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price >= 0),
  unit        TEXT NOT NULL DEFAULT 'hr',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_updated_at ON public.studio_packages;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.studio_packages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.studio_add_ons;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.studio_add_ons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS: public read, staff-only write
ALTER TABLE public.studio_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view studio packages" ON public.studio_packages
  FOR SELECT USING (true);
CREATE POLICY "Admin+ can manage studio packages" ON public.studio_packages
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));
CREATE POLICY "Admin+ can update studio packages" ON public.studio_packages
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));
CREATE POLICY "Admin+ can delete studio packages" ON public.studio_packages
  FOR DELETE USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

CREATE POLICY "Anyone can view studio add-ons" ON public.studio_add_ons
  FOR SELECT USING (true);
CREATE POLICY "Admin+ can manage studio add-ons" ON public.studio_add_ons
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));
CREATE POLICY "Admin+ can update studio add-ons" ON public.studio_add_ons
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));
CREATE POLICY "Admin+ can delete studio add-ons" ON public.studio_add_ons
  FOR DELETE USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

-- Seed with today's live values so switching from hardcoded -> DB-driven
-- changes nothing a visitor sees.
INSERT INTO public.studio_packages (name, price, original_price, duration_label, description, is_best_value, sort_order)
VALUES
  ('Quick Session', 999, 1499, 'Per Hour', 'Includes Photo/Video Space, 3 Lights, 1 Tripod', false, 1),
  ('Creator Session', 3499, 3999, '4 Hours', 'Perfect for portrait sessions or quick product shoots.', false, 2),
  ('Production Day', 6999, 7999, '8 Hours', 'Best for elaborate setups, commercial shoots, and music videos.', true, 3);

INSERT INTO public.studio_add_ons (name, price, unit, sort_order)
VALUES
  ('Pro Cameraman', 1000, 'hr', 1),
  ('Studio Assistant', 250, 'hr', 2);

COMMIT;
