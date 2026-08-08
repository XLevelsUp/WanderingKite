-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — correct "Studio Space Influencer Reel" folder path.
-- The page-1 top-level index (00051) recorded it at the site root
-- ("WANDERING KITE/Studio Space Influencer Reel"), but the detailed
-- per-drive log shows its real location is inside Review Reel, with a
-- "Promotion Reel" category the first import didn't capture.
-- Idempotent: plain re-assignment, safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.media_records
SET folder_path = 'WK 2TB 01/Review Reel/Studio Space Influencer Reel',
    notes = 'Promotion Reel',
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND title = 'Studio Space Influencer Reel'
  AND folder_path = 'WANDERING KITE/Studio Space Influencer Reel';
