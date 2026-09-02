-- ═══════════════════════════════════════════════════════════════════════════
-- STUDIO BLOG CATEGORIES
--
-- 00066 shipped four photography categories. The studiospace blog needs its
-- own set, so these are appended to the same "BlogCategory" enum rather than
-- creating a second type — a post's `section` column already says which blog
-- it belongs to, and the admin UI filters the category list by section.
--
-- New values:
--   STUDIO_SPACE, VIDEO_PRODUCTION, CONTENT_CREATION,
--   PODCAST_AUDIO, EQUIPMENT_TECHNIQUES
--
-- PHOTOGRAPHY is deliberately NOT added: the existing photography blog
-- already has its own four categories, and the studio blog reuses the label
-- "Photography" via a dedicated value below so the two lists stay independent.
--
-- Postgres cannot add an enum value and use it in the same transaction, so
-- this migration only adds values. 00069 seeds the post that uses them.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TYPE "BlogCategory" ADD VALUE IF NOT EXISTS 'STUDIO_SPACE';
ALTER TYPE "BlogCategory" ADD VALUE IF NOT EXISTS 'STUDIO_PHOTOGRAPHY';
ALTER TYPE "BlogCategory" ADD VALUE IF NOT EXISTS 'VIDEO_PRODUCTION';
ALTER TYPE "BlogCategory" ADD VALUE IF NOT EXISTS 'CONTENT_CREATION';
ALTER TYPE "BlogCategory" ADD VALUE IF NOT EXISTS 'PODCAST_AUDIO';
ALTER TYPE "BlogCategory" ADD VALUE IF NOT EXISTS 'EQUIPMENT_TECHNIQUES';
