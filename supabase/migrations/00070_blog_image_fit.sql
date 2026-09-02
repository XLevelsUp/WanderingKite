-- ═══════════════════════════════════════════════════════════════════════════
-- BLOG IMAGE FIT — let the author choose how each image sits in its frame.
--
-- Blog images were rendered with object-cover throughout, which fills the
-- frame but crops. That suits wide editorial photographs and badly suits
-- anything where the whole frame matters — portrait shots, screenshots,
-- posters, graphics with text near the edges.
--
-- COVER   fills the frame, cropping the overflow (default, unchanged
--         behaviour for existing rows)
-- CONTAIN fits the whole image inside the frame, letterboxing the remainder
--
-- Applies to the post's featured image and to each section image
-- independently, since a post may want one of each.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TYPE "BlogImageFit" AS ENUM ('COVER', 'CONTAIN');

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS featured_image_fit "BlogImageFit" NOT NULL DEFAULT 'COVER';

ALTER TABLE public.blog_sections
  ADD COLUMN IF NOT EXISTS image_fit "BlogImageFit" NOT NULL DEFAULT 'COVER';

COMMIT;
