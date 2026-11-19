-- ═══════════════════════════════════════════════════════════════════════════
-- PHOTOGRAPHY CATALOG — sections, groups, categories, cities + album fields.
--
-- Powers the photography revamp:
--   /photography                                   hub
--   /photography/{section}                         weddings | corporate
--   /photography/{section}/{category}              e.g. /photography/weddings/hindu
--   /photography/{section}/{category}/{album-slug} album story page
--   /photography/wedding-photographer-in-{city}    city landing pages
--
-- Hierarchy: section → group → category. Groups only organise menus/tabs
-- (Wedding, Baby Photoshoot, Gallery, Events); URLs use section + category.
-- "Outdoor" (pre/post-wedding) is a `subgroup` label, not a URL level.
--
-- Albums stay in the existing `shoots` / `gallery_images` tables (managed in
-- Admin → Portfolio). Legacy `category` / `sub_category` columns are kept
-- untouched so nothing that reads them breaks; new pages use `category_id`.
--
-- Idempotent: safe to re-run (IF NOT EXISTS / ON CONFLICT / guarded updates).
-- After running: regenerate types (supabase gen types) for apps/admin and
-- apps/marketing, or the new columns won't type-check.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Lookup tables ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.photo_sections (
  slug        TEXT PRIMARY KEY,                -- URL segment: weddings | corporate
  name        TEXT NOT NULL,                   -- "Weddings & Events"
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photo_groups (
  section_slug TEXT NOT NULL REFERENCES public.photo_sections(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  slug         TEXT NOT NULL,                  -- wedding | baby | gallery | events | corporate
  name         TEXT NOT NULL,
  sort_order   INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (section_slug, slug)
);

CREATE TABLE IF NOT EXISTS public.photo_categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_slug TEXT NOT NULL,
  group_slug   TEXT NOT NULL,
  slug         TEXT NOT NULL,                  -- URL segment, unique within the section
  name         TEXT NOT NULL,                  -- tab / menu label
  subgroup     TEXT,                           -- optional menu sub-heading, e.g. 'Outdoor'
  intro        TEXT,                           -- SEO intro paragraph on the category page (editable)
  sort_order   INT  NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (section_slug, slug),
  FOREIGN KEY (section_slug, group_slug)
    REFERENCES public.photo_groups(section_slug, slug) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.photo_cities (
  slug        TEXT PRIMARY KEY,                -- coimbatore | chennai | …
  name        TEXT NOT NULL,
  state       TEXT NOT NULL,
  intro       TEXT,                            -- unique copy for the city landing page (editable)
  sort_order  INT  NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Seed: sections, groups, categories, cities ─────────────────────────

INSERT INTO public.photo_sections (slug, name, sort_order) VALUES
  ('weddings',  'Weddings & Events', 1),
  ('corporate', 'Corporate',         2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.photo_groups (section_slug, slug, name, sort_order) VALUES
  ('weddings',  'wedding',   'Wedding',         1),
  ('weddings',  'baby',      'Baby Photoshoot', 2),
  ('weddings',  'gallery',   'Gallery',         3),
  ('weddings',  'events',    'Events',          4),
  ('corporate', 'corporate', 'Corporate',       1)
ON CONFLICT (section_slug, slug) DO NOTHING;

INSERT INTO public.photo_categories (section_slug, group_slug, slug, name, subgroup, sort_order) VALUES
  -- Wedding
  ('weddings', 'wedding', 'muslim',              'Muslim',              NULL,      1),
  ('weddings', 'wedding', 'hindu',               'Hindu',               NULL,      2),
  ('weddings', 'wedding', 'christian',           'Christian',           NULL,      3),
  ('weddings', 'wedding', 'kongu',               'Kongu Wedding',       NULL,      4),
  ('weddings', 'wedding', 'telugu',              'Telugu',              NULL,      5),
  ('weddings', 'wedding', 'mapillai-azhaippu',   'Mapillai Azhaippu',   NULL,      6),
  ('weddings', 'wedding', 'engagement',          'Engagement',          NULL,      7),
  ('weddings', 'wedding', 'reception',           'Reception',           NULL,      8),
  -- Baby Photoshoot
  ('weddings', 'baby',    'baby-shower',         'Baby Shower',         NULL,      1),
  ('weddings', 'baby',    'baby-shoots',         'Baby Shoots',         NULL,      2),
  ('weddings', 'baby',    'baby-bumps',          'Baby Bumps',          NULL,      3),
  ('weddings', 'baby',    'toddlers',            'Toddlers Photography', NULL,     4),
  -- Gallery
  ('weddings', 'gallery', 'bridal-portraits',    'Bridal Portraits',    NULL,      1),
  ('weddings', 'gallery', 'couple-portraits',    'Couple Portraits',    NULL,      2),
  ('weddings', 'gallery', 'groom-portraits',     'Groom Portraits',     NULL,      3),
  ('weddings', 'gallery', 'candid-moments',      'Candid Moments',      NULL,      4),
  ('weddings', 'gallery', 'pre-wedding',         'Pre-wedding',         'Outdoor', 5),
  ('weddings', 'gallery', 'post-wedding',        'Post-wedding',        'Outdoor', 6),
  -- Events
  ('weddings', 'events',  'house-warming',       'House Warming',       NULL,      1),
  ('weddings', 'events',  'puberty',             'Puberty',             NULL,      2),
  ('weddings', 'events',  'family-get-together', 'Family Get-together', NULL,      3),
  ('weddings', 'events',  'parties',             'Parties',             NULL,      4),
  ('weddings', 'events',  'birthday-parties',    'Birthday Parties',    NULL,      5),
  -- Corporate
  ('corporate', 'corporate', 'corporate-events',     'Corporate Events',        NULL, 1),
  ('corporate', 'corporate', 'conferences-seminars', 'Conferences & Seminars',  NULL, 2),
  ('corporate', 'corporate', 'product-launches',     'Product Launches',        NULL, 3),
  ('corporate', 'corporate', 'headshots',            'Headshots',               NULL, 4),
  ('corporate', 'corporate', 'product-photography',  'Product Photography',     NULL, 5),
  ('corporate', 'corporate', 'ads-commercials',      'Ads & Commercials',       NULL, 6),
  ('corporate', 'corporate', 'music-videos',         'Music Videos',            NULL, 7),
  ('corporate', 'corporate', 'short-films',          'Short Films',             NULL, 8)
ON CONFLICT (section_slug, slug) DO NOTHING;

INSERT INTO public.photo_cities (slug, name, state, sort_order) VALUES
  ('coimbatore', 'Coimbatore', 'Tamil Nadu', 1),
  ('chennai',    'Chennai',    'Tamil Nadu', 2),
  ('bangalore',  'Bangalore',  'Karnataka',  3),
  ('salem',      'Salem',      'Tamil Nadu', 4),
  ('erode',      'Erode',      'Tamil Nadu', 5),
  ('tiruppur',   'Tiruppur',   'Tamil Nadu', 6),
  ('pollachi',   'Pollachi',   'Tamil Nadu', 7)
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Album fields on shoots ──────────────────────────────────────────────

ALTER TABLE public.shoots
  ADD COLUMN IF NOT EXISTS slug            TEXT,
  ADD COLUMN IF NOT EXISTS category_id     UUID REFERENCES public.photo_categories(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS city_slug       TEXT REFERENCES public.photo_cities(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_names    TEXT,          -- "Arun & Priya" / "Acme Pvt Ltd"
  ADD COLUMN IF NOT EXISTS story           TEXT,          -- short story shown on the album page
  ADD COLUMN IF NOT EXISTS shoot_date      DATE,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS featured        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE public.shoots ADD CONSTRAINT shoots_status_check CHECK (status IN ('draft', 'published'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- A published album must be routable: it needs a category and a slug.
DO $$ BEGIN
  ALTER TABLE public.shoots ADD CONSTRAINT shoots_published_routable
    CHECK (status <> 'published' OR (category_id IS NOT NULL AND slug IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 4. Backfill existing albums ────────────────────────────────────────────

-- 4a. Slug from title (lowercase, hyphenated), suffixed -2, -3… on duplicates.
WITH base AS (
  SELECT id,
         NULLIF(trim(BOTH '-' FROM regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')), '') AS s,
         created_at
  FROM public.shoots
  WHERE slug IS NULL
), numbered AS (
  SELECT id, COALESCE(s, 'album') AS s,
         row_number() OVER (PARTITION BY COALESCE(s, 'album') ORDER BY created_at, id) AS n
  FROM base
)
UPDATE public.shoots sh
SET slug = CASE WHEN n.n = 1 THEN n.s ELSE n.s || '-' || n.n END
FROM numbered n
WHERE sh.id = n.id;

-- Guard against a backfilled slug colliding with one set by hand earlier.
UPDATE public.shoots sh
SET slug = sh.slug || '-' || left(sh.id::text, 8)
WHERE EXISTS (SELECT 1 FROM public.shoots o WHERE o.slug = sh.slug AND o.id <> sh.id AND o.created_at < sh.created_at);

CREATE UNIQUE INDEX IF NOT EXISTS shoots_slug_key ON public.shoots (slug);

-- 4b. Map legacy category/sub_category onto the new categories where the match is unambiguous.
--     Anything not matched (e.g. old 'events/wedding' — tradition unknown) stays unassigned
--     and in draft, for you to classify in Admin → Portfolio.
WITH legacy_map (old_category, old_sub, new_section, new_slug) AS (VALUES
  ('events',     'engagements',        'weddings',  'engagement'),
  ('events',     'birthdays',          'weddings',  'birthday-parties'),
  ('events',     'house-warming',      'weddings',  'house-warming'),
  ('events',     'puberty-ceremonies', 'weddings',  'puberty'),
  ('portraits',  'maternity',          'weddings',  'baby-bumps'),
  ('portraits',  'baby-shoots',        'weddings',  'baby-shoots'),
  ('corporate',  'headshots',          'corporate', 'headshots'),
  ('corporate',  'product',            'corporate', 'product-photography'),
  ('commercial', 'ads',                'corporate', 'ads-commercials'),
  ('commercial', 'music-videos',       'corporate', 'music-videos'),
  ('commercial', 'short-films',        'corporate', 'short-films')
)
UPDATE public.shoots sh
SET category_id = pc.id
FROM legacy_map m
JOIN public.photo_categories pc ON pc.section_slug = m.new_section AND pc.slug = m.new_slug
WHERE sh.category_id IS NULL
  AND lower(sh.category) = m.old_category
  AND lower(COALESCE(sh.sub_category, '')) = m.old_sub;

-- 4c. Cover = first gallery image (by sort_order) where none is set.
UPDATE public.shoots sh
SET cover_image_url = gi.url
FROM (
  SELECT DISTINCT ON (shoot_id) shoot_id, url
  FROM public.gallery_images
  ORDER BY shoot_id, sort_order, created_at
) gi
WHERE sh.id = gi.shoot_id AND sh.cover_image_url IS NULL;

-- 4d. Albums that were already live and now have a category stay live; the rest remain draft.
UPDATE public.shoots
SET status = 'published'
WHERE status = 'draft' AND category_id IS NOT NULL AND slug IS NOT NULL;

-- ── 5. Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS shoots_category_published_idx ON public.shoots (category_id, shoot_date DESC NULLS LAST) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS shoots_city_published_idx     ON public.shoots (city_slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS shoots_featured_idx           ON public.shoots (featured) WHERE status = 'published' AND featured;
CREATE INDEX IF NOT EXISTS gallery_images_shoot_order_idx ON public.gallery_images (shoot_id, sort_order);

-- ── 6. updated_at triggers ─────────────────────────────────────────────────

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['photo_sections','photo_groups','photo_categories','photo_cities','shoots'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t);
  END LOOP;
END $$;

-- ── 7. Row level security ──────────────────────────────────────────────────
-- shoots / gallery_images were created outside migrations, so their existing
-- policies are unknown. Drop them all and recreate a known set:
--   public  → read published albums (and their images) + active lookups only
--   editors → full access (same roles as the blog: ADMIN, SUPER_ADMIN, DEVELOPER, MARKETING)

DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('shoots', 'gallery_images')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

ALTER TABLE public.shoots           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_groups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_cities     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published shoots" ON public.shoots
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anyone can view images of published shoots" ON public.gallery_images
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shoots s WHERE s.id = gallery_images.shoot_id AND s.status = 'published'));

DO $$
DECLARE t TEXT;
BEGIN
  -- Lookups: public sees active rows (sections/groups have no is_active, so all rows).
  FOREACH t IN ARRAY ARRAY['photo_sections','photo_groups'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can view %1$s" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "Anyone can view %1$s" ON public.%1$s FOR SELECT USING (true)', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['photo_categories','photo_cities'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can view active %1$s" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "Anyone can view active %1$s" ON public.%1$s FOR SELECT USING (is_active)', t);
  END LOOP;

  -- Editors: read everything (drafts, inactive) and write.
  FOREACH t IN ARRAY ARRAY['shoots','gallery_images','photo_sections','photo_groups','photo_categories','photo_cities'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Editors can view all %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Editors can insert %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Editors can update %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Editors can delete %1$s" ON public.%1$s', t);
    EXECUTE format(
      'CREATE POLICY "Editors can view all %1$s" ON public.%1$s FOR SELECT USING '
      '(public.get_user_role(auth.uid()) IN (''ADMIN'',''SUPER_ADMIN'',''DEVELOPER'',''MARKETING''))', t);
    EXECUTE format(
      'CREATE POLICY "Editors can insert %1$s" ON public.%1$s FOR INSERT WITH CHECK '
      '(public.get_user_role(auth.uid()) IN (''ADMIN'',''SUPER_ADMIN'',''DEVELOPER'',''MARKETING''))', t);
    EXECUTE format(
      'CREATE POLICY "Editors can update %1$s" ON public.%1$s FOR UPDATE USING '
      '(public.get_user_role(auth.uid()) IN (''ADMIN'',''SUPER_ADMIN'',''DEVELOPER'',''MARKETING''))', t);
    EXECUTE format(
      'CREATE POLICY "Editors can delete %1$s" ON public.%1$s FOR DELETE USING '
      '(public.get_user_role(auth.uid()) IN (''ADMIN'',''SUPER_ADMIN'',''DEVELOPER'',''MARKETING''))', t);
  END LOOP;
END $$;

COMMIT;

-- ── Run this after to see what still needs classifying in Admin → Portfolio ──
-- SELECT id, title, category, sub_category, slug, status
-- FROM public.shoots WHERE category_id IS NULL ORDER BY created_at DESC;
