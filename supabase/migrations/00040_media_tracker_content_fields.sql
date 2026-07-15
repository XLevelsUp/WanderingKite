-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — content breakdown per shoot.
-- Adds photo/video counts and size (GB) to media_records so the Storage Map
-- can show per-device usage (donut) and a Photos/Videos folder split.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.media_records
  ADD COLUMN IF NOT EXISTS photo_count INTEGER NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
  ADD COLUMN IF NOT EXISTS video_count INTEGER NOT NULL DEFAULT 0 CHECK (video_count >= 0),
  ADD COLUMN IF NOT EXISTS size_gb NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (size_gb >= 0);
