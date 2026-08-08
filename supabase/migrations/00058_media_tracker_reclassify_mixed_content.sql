-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — reclassify the small, defensible subset of imported rows
-- that were guessed into video_size_gb during the original import (00051)
-- despite explicitly containing a "photos" tag alongside video tags — i.e.
-- genuinely mixed content, not confirmed all-video. Moves their size into
-- the new other_size_gb bucket (00057) instead of guessing a split.
-- Everything else from the original import is left untouched; individual
-- rows can still be corrected by hand via the Edit form as needed.
-- Idempotent: only touches rows where video_size_gb still holds the exact
-- originally-imported value, so re-running (or running after a manual
-- correction) is a no-op.
-- ═══════════════════════════════════════════════════════════════════════════

-- NKAB Mettupalayam(05-01-2026) — tags: Drone, Insta 360, photos, Videos
UPDATE public.media_records
SET other_size_gb = 292.82,
    video_size_gb = 0,
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND title = 'NKAB Mettupalayam(05-01-2026)'
  AND folder_path = 'WK 2TB 01/Wandering Kite Studio/WK Corporates/NKAB Mettupalayam(05-01-2026)'
  AND video_size_gb = 292.82;

-- BNI 24.04.26 — tags: Assets, DJI, Musics, Photos, Proj PP
UPDATE public.media_records
SET other_size_gb = 19.21,
    video_size_gb = 0,
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND title = 'BNI 24.04.26'
  AND folder_path = 'WK 2TB 02/Wandering Kite/WK Corporate/BNI 24.04.2026 Coffee Table'
  AND video_size_gb = 19.21;
