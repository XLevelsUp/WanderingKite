-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — fields needed to import the historical "WK DB Tracker"
-- spreadsheet without data loss.
-- client_id becomes optional: many tracked projects (internal reels,
-- templates/LUTs, corporate/brand shoots) have no real client behind them.
-- folder_path/content_tags preserve the exact drive path and sub-folder/file
-- tags the spreadsheet recorded per project.
-- backup_copy_2_device_id adds a 4th storage slot (the spreadsheet's
-- "Backup 02" column) alongside the existing primary/original backup/backup
-- copy slots.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.media_records
  ALTER COLUMN client_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS folder_path TEXT,
  ADD COLUMN IF NOT EXISTS content_tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS backup_copy_2_device_id UUID
    REFERENCES public.storage_devices(id) ON DELETE SET NULL;
