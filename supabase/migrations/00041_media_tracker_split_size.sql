-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — split total size into photo/video size.
-- A single size_gb can't say how much of a device's usage is photos vs
-- videos (videos are much larger per item) — split it so the Storage Map
-- pie can be storage-accurate instead of just item-count-accurate.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.media_records
  DROP COLUMN IF EXISTS size_gb;

ALTER TABLE public.media_records
  ADD COLUMN IF NOT EXISTS photo_size_gb NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (photo_size_gb >= 0),
  ADD COLUMN IF NOT EXISTS video_size_gb NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (video_size_gb >= 0);
