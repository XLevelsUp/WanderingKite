-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — add "WK HDD 001" device and correct the Working Files
-- location for the 9 top-level projects from the original tracker (page 1),
-- which actually live on WK HDD 001, not WK 2TB 01 as first imported in
-- 00051. This moves their primary_storage_device_id from WK 2TB 01 to the
-- new WK HDD 001 device — it does not create duplicate records.
-- Idempotent: safe to re-run: device insert is ON CONFLICT DO NOTHING, and
-- the record updates are plain re-assignments (running twice is a no-op).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. New device
INSERT INTO public.storage_devices (label, type, capacity)
VALUES ('WK HDD 001', 'HDD', 'HDD')
ON CONFLICT DO NOTHING;

-- 2. Move the 9 affected records off WK 2TB 01 onto WK HDD 001
DO $$
DECLARE
  d_hdd001 uuid;
  d_2tb01 uuid;
BEGIN
  SELECT id INTO d_hdd001 FROM public.storage_devices WHERE label = 'WK HDD 001' LIMIT 1;
  SELECT id INTO d_2tb01 FROM public.storage_devices WHERE label = 'WK 2TB 01' LIMIT 1;

  UPDATE public.media_records
  SET primary_storage_device_id = d_hdd001,
      updated_at = NOW()
  WHERE deleted_at IS NULL
    AND (primary_storage_device_id = d_2tb01 OR primary_storage_device_id IS NULL)
    AND (
      (title = 'Harshitha Puberty 24.5.2026' AND folder_path = 'WANDERING KITE/WK Weddings & Events/Harshitha Puberty 24.5.2026')
      OR (title = 'RACHANAA PUBERTY 26-04-2026' AND folder_path = 'WANDERING KITE/WK Weddings & Events/RACHANAA PUBERTY 26-04-2026')
      OR (title = 'Saravana + Hema 24&25th March 26' AND folder_path = 'WANDERING KITE/WK Weddings & Events/Saravana + Hema 24&25th March 26')
      OR (title = 'Vedha Puberty 7.5.2026' AND folder_path = 'WANDERING KITE/WK Weddings & Events/Vedha Puberty 7.5.2026')
      OR (title = 'Studio Space Influencer Reel' AND folder_path = 'WANDERING KITE/Studio Space Influencer Reel')
      OR (title = 'Unacademy Bts Videos' AND folder_path = 'WANDERING KITE/Unacademy Bts Videos')
      OR (title = 'Pratyagra Interview' AND folder_path IS NULL)
      OR (title = 'Thirumurugan singer photoshoot on studio space' AND folder_path = 'WANDERING KITE/Review Reel/Thirumurugan Singers Shoot')
      OR (title = 'Pratyagra Influencer Reel 11.07.2026' AND folder_path = 'WANDERING KITE/Pratyagra Influencer Reel 11.07.2026')
    );
END $$;
