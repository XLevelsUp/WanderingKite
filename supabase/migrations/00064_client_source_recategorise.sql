-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENT SOURCE — re-categorise conversion channels.
--
-- Replaces the original 7 channels from 00049 (INSTAGRAM, REDDIT, YOUTUBE,
-- WHATSAPP, REFERRAL, BLOGGER, OTHER) with the channels the studio actually
-- reports on:
--
--   ADS, GOOGLE, WEBSITE, WALKIN, REFERRAL, AI, SOCIAL_MEDIA
--   + UNKNOWN — legacy-only, for rows that predate mandatory tracking.
--
-- Postgres cannot remove values from an existing enum, so a new type is
-- created and the column is swapped over.
--
-- The old platform-specific values all collapse into SOCIAL_MEDIA. The
-- platform name is written into source_detail so no information is lost —
-- an INSTAGRAM row becomes SOCIAL_MEDIA + "Instagram".
--
-- source becomes NOT NULL. Both insert paths set it explicitly:
--   - actions/clients.ts        (admin form — operator picks a channel)
--   - app/api/client/signup     (self-signup — hardcoded to WEBSITE)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. New enum type
CREATE TYPE "ClientSource_v2" AS ENUM (
  'ADS',
  'GOOGLE',
  'WEBSITE',
  'WALKIN',
  'REFERRAL',
  'AI',
  'SOCIAL_MEDIA',
  'UNKNOWN'
);

-- 2. Preserve the old platform name in source_detail before the values are
--    collapsed. Only fills blanks — a detail the operator typed by hand wins.
UPDATE public.clients
   SET source_detail = CASE source::text
                         WHEN 'INSTAGRAM' THEN 'Instagram'
                         WHEN 'REDDIT'    THEN 'Reddit'
                         WHEN 'YOUTUBE'   THEN 'YouTube'
                         WHEN 'WHATSAPP'  THEN 'WhatsApp'
                         WHEN 'BLOGGER'   THEN 'Blogger'
                       END
 WHERE source::text IN ('INSTAGRAM','REDDIT','YOUTUBE','WHATSAPP','BLOGGER')
   AND (source_detail IS NULL OR btrim(source_detail) = '');

-- 3. Swap the column over to the new type, mapping every old value.
--    OTHER and NULL become UNKNOWN — we do not invent a channel for rows
--    that were never tracked.
ALTER TABLE public.clients
  ALTER COLUMN source TYPE "ClientSource_v2"
  USING (
    CASE source::text
      WHEN 'INSTAGRAM' THEN 'SOCIAL_MEDIA'
      WHEN 'REDDIT'    THEN 'SOCIAL_MEDIA'
      WHEN 'YOUTUBE'   THEN 'SOCIAL_MEDIA'
      WHEN 'WHATSAPP'  THEN 'SOCIAL_MEDIA'
      WHEN 'BLOGGER'   THEN 'SOCIAL_MEDIA'
      WHEN 'REFERRAL'  THEN 'REFERRAL'
      WHEN 'OTHER'     THEN 'UNKNOWN'
      ELSE 'UNKNOWN'
    END
  )::"ClientSource_v2";

-- 4. Backfill rows that never had a source, then enforce NOT NULL.
UPDATE public.clients
   SET source = 'UNKNOWN'
 WHERE source IS NULL;

ALTER TABLE public.clients
  ALTER COLUMN source SET NOT NULL;

-- 5. Retire the old type and adopt the canonical name.
DROP TYPE "ClientSource";
ALTER TYPE "ClientSource_v2" RENAME TO "ClientSource";

-- 6. Rebuild the index. The 00049 index was partial (WHERE source IS NOT NULL),
--    which is now pointless since the column is NOT NULL.
DROP INDEX IF EXISTS idx_clients_source;
CREATE INDEX idx_clients_source ON public.clients(source);

COMMIT;
