-- ═══════════════════════════════════════════════════════════════════════════
-- BLOG SYSTEM — admin-authored posts with a fixed structure.
--
-- The structure is intentionally NOT a freeform page builder. A post is:
--   intro → ordered sections (each with optional image + sub-sections)
--         → Q&A pairs → one CTA block with buttons
--
-- Depends on 00065 having added the 'MARKETING' enum value (separate
-- migration — Postgres cannot use a new enum value in the transaction that
-- creates it).
--
-- Posts are PUBLICLY READABLE — /blog is an anonymous marketing page, same
-- reasoning as studio_packages in 00061. Writes are restricted to staff plus
-- MARKETING.
--
-- Comments are anonymous-writable but always land as PENDING: the INSERT
-- policy pins the status column so a client cannot self-approve. Only
-- APPROVED comments are publicly readable.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Enums ───────────────────────────────────────────────────────────────────

-- Which public section a post belongs to. Only PHOTOGRAPHY is used today;
-- STUDIO is here so the studiospace blog does not need a schema change.
CREATE TYPE "BlogSection" AS ENUM ('PHOTOGRAPHY', 'STUDIO');

CREATE TYPE "BlogCategory" AS ENUM (
  'WEDDING_EVENT',
  'PORTRAITS_LIFESTYLE',
  'COMMERCIAL_BRAND',
  'TIPS_INSIGHTS'
);

-- How a section's body renders. Sections are usually prose, but some are a
-- numbered process or a bulleted list (see S4/S5 of the launch post).
CREATE TYPE "BlogBodyType" AS ENUM ('RICH_TEXT', 'ORDERED_LIST', 'BULLET_LIST');

CREATE TYPE "BlogCommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- ── Posts ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  section           "BlogSection" NOT NULL DEFAULT 'PHOTOGRAPHY',
  category          "BlogCategory" NOT NULL,

  -- One featured image, used for both the listing card and the detail hero.
  featured_image     TEXT,
  featured_image_alt TEXT,

  intro             TEXT NOT NULL DEFAULT '',
  author            TEXT NOT NULL DEFAULT 'Wandering Kite Photography Team',
  tags              TEXT[] NOT NULL DEFAULT '{}',

  -- Auto-estimated from word count on save, but editable by the author.
  reading_time      INTEGER NOT NULL DEFAULT 5 CHECK (reading_time > 0),

  -- Backdatable. Posts go live on save, so this is a display/ordering date
  -- rather than a scheduling gate.
  published_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  meta_title        TEXT,
  -- Falls back to an excerpt of intro at render time when null.
  meta_description  TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_section_published
  ON public.blog_posts(section, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON public.blog_posts(category);

-- ── Sections ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  heading     TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  body_type   "BlogBodyType" NOT NULL DEFAULT 'RICH_TEXT',

  -- Optional, and renders AFTER the section body (before sub-sections).
  -- Images cannot be positioned mid-paragraph by design.
  image       TEXT,
  image_alt   TEXT,

  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_sections_post
  ON public.blog_sections(post_id, sort_order);

CREATE TABLE IF NOT EXISTS public.blog_subsections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  UUID NOT NULL REFERENCES public.blog_sections(id) ON DELETE CASCADE,
  heading     TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  body_type   "BlogBodyType" NOT NULL DEFAULT 'RICH_TEXT',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_subsections_section
  ON public.blog_subsections(section_id, sort_order);

-- ── Q&A ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_qa (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_qa_post
  ON public.blog_qa(post_id, sort_order);

-- ── CTA ─────────────────────────────────────────────────────────────────────
-- One CTA block per post (enforced by the UNIQUE on post_id).

CREATE TABLE IF NOT EXISTS public.blog_cta (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL UNIQUE REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  heading     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_cta_buttons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_id      UUID NOT NULL REFERENCES public.blog_cta(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  href        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_cta_buttons_cta
  ON public.blog_cta_buttons(cta_id, sort_order);

-- ── Comments ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name   TEXT NOT NULL,
  author_email  TEXT,
  body          TEXT NOT NULL,
  status        "BlogCommentStatus" NOT NULL DEFAULT 'PENDING',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_status
  ON public.blog_comments(post_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_moderation
  ON public.blog_comments(status, created_at DESC);

-- ── updated_at triggers ─────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS set_updated_at ON public.blog_posts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.blog_sections;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.blog_subsections;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_subsections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.blog_qa;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_qa
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.blog_cta;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_cta
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.blog_comments;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.blog_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_sections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_subsections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_qa          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_cta         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_cta_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments    ENABLE ROW LEVEL SECURITY;

-- Content tables: public read, staff+marketing write.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'blog_posts','blog_sections','blog_subsections',
    'blog_qa','blog_cta','blog_cta_buttons'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "Anyone can view %1$s" ON public.%1$s FOR SELECT USING (true)', t);
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

-- Comments: anyone may read APPROVED ones.
CREATE POLICY "Anyone can view approved comments" ON public.blog_comments
  FOR SELECT USING (status = 'APPROVED');

-- Anyone may submit, but ONLY as PENDING — a client cannot self-approve by
-- posting status: 'APPROVED'. The server action also sets this explicitly;
-- this policy is the backstop.
CREATE POLICY "Anyone can submit a pending comment" ON public.blog_comments
  FOR INSERT WITH CHECK (status = 'PENDING');

-- Moderators see and act on everything.
CREATE POLICY "Editors can view all comments" ON public.blog_comments
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('ADMIN','SUPER_ADMIN','DEVELOPER','MARKETING'));
CREATE POLICY "Editors can update comments" ON public.blog_comments
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('ADMIN','SUPER_ADMIN','DEVELOPER','MARKETING'));
CREATE POLICY "Editors can delete comments" ON public.blog_comments
  FOR DELETE USING (
    public.get_user_role(auth.uid()) IN ('ADMIN','SUPER_ADMIN','DEVELOPER','MARKETING'));

COMMIT;
