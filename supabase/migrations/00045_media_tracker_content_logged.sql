-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — distinguish "content genuinely empty" from "never logged".
-- photo_count/video_count/photo_size_gb/video_size_gb all default to 0, so a
-- shoot nobody has entered numbers for looks identical to one confirmed to
-- have zero content. content_logged_at is set the moment a human actually
-- saves the Content section (full form with a nonzero value, or the
-- dedicated quick "Edit content" dialog, which always confirms — even 0s).
-- NULL means: nobody has reviewed this shoot's content yet.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.media_records
  ADD COLUMN IF NOT EXISTS content_logged_at TIMESTAMP WITH TIME ZONE;
