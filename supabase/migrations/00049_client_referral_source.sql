-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENT REFERRAL SOURCE — Track how each client found the studio.
--
-- Adds two columns to public.clients:
--   source        — one of 7 fixed channels (nullable — old rows unaffected)
--   source_detail — free-text supplement used only when source = 'OTHER'
--
-- The enum is named "ClientSource" to follow the project's PascalCase enum
-- convention (see "UserRole", "BookingStatus", etc.).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Create the enum type
CREATE TYPE "ClientSource" AS ENUM (
  'INSTAGRAM',
  'REDDIT',
  'YOUTUBE',
  'WHATSAPP',
  'REFERRAL',
  'BLOGGER',
  'OTHER'
);

-- 2. Add columns to the clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS source        "ClientSource" NULL,
  ADD COLUMN IF NOT EXISTS source_detail TEXT           NULL;

-- 3. Index for filtering clients by source in the list page
CREATE INDEX IF NOT EXISTS idx_clients_source ON public.clients(source)
  WHERE source IS NOT NULL;

COMMIT;
