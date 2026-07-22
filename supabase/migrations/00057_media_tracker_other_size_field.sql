-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — "unsorted" size bucket.
-- photo_size_gb/video_size_gb (00041) force every GB into a photo-or-video
-- bucket, but plenty of tracked footage (archival imports, quick log entries)
-- has a known total size with no confirmed photo/video split. Recording that
-- as a guess into either bucket corrupts the Storage Map's photo-vs-video
-- pie. other_size_gb is a third, honest bucket: "this much space is used,
-- split unknown."
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.media_records
  ADD COLUMN IF NOT EXISTS other_size_gb NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (other_size_gb >= 0);
