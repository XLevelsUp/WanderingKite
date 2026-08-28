-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER MANAGER — per-user permission override.
-- Media tracker create/edit/delete rights are normally ADMIN+ only (see
-- requireAdmin() in actions/media-tracker.ts). This lets an ADMIN grant that
-- same manage capability to an individual EMPLOYEE without promoting them to
-- ADMIN and its unrelated privileges (clients, invoices, HR, etc). It's
-- independent of the role hierarchy in lib/access.ts — a targeted override,
-- not a new role tier.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS can_manage_media_tracker BOOLEAN NOT NULL DEFAULT false;
