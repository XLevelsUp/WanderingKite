-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE DEVICES — soft delete.
-- Devices were previously retire-only (is_active flag, still visible in the
-- UI). This adds a genuine soft delete for devices that were never real
-- (test/demo entries) so they can disappear from the UI entirely, while
-- still protecting devices that have media_records attached — those can
-- only be retired, never deleted, since deleting them would break backup
-- history on real tracked shoots.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.storage_devices
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
