-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — dedicated "category" field (the PDF's "File Type" column:
-- Review Reel, Review Reel and BTS, Interior Images, Product Shoot, Corporate
-- Video, Photoshoot, House warming album, etc.). Previously this was just
-- stuffed into the free-text notes column during import — this promotes it
-- to its own column so it's filterable/sortable, and frees notes back up for
-- actual remarks.
-- Backfill: every row imported in 00051/00052 had its File Type value placed
-- directly into notes with nothing else mixed in, so for those rows notes IS
-- the category — move it over and clear notes. Rows added by hand (with
-- real free-text notes rather than a bare category string) are untouched.
-- Idempotent: only backfills rows where category IS NULL, so re-running
-- this migration after someone has since edited category/notes by hand is
-- a no-op, not a clobber.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.media_records
  ADD COLUMN IF NOT EXISTS category TEXT;

UPDATE public.media_records
SET category = notes,
    notes = NULL
WHERE deleted_at IS NULL
  AND category IS NULL
  AND notes IN (
    'Review Reel', 'Review Reel and BTS', 'Photoshoot', 'Interior Images',
    'House warming album', 'Corporate Video', 'Corporate Photos',
    'Product and interior shoot', 'Product Shoot', 'Inauguration',
    'House warming', 'Wedding', 'Puberty', 'Templates', 'LUT',
    'CorporateVideo', 'Corporate Reel', 'Lifestyle Video', 'BTS',
    'Promotion Reel'
  );
