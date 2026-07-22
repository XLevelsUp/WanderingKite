-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — historical import from "Copy of Wandering Kite DB Tracker"
-- (the spreadsheet the studio maintained by hand before this feature shipped).
-- Split across two migrations for size: this one covers storage devices plus
-- every record physically stored on WK 2TB 01 (pages 1, 2, 3 of the source).
-- The WK 2TB 02 / WK 4TB 01 records continue in 00052.
-- Idempotent: devices are matched by label, records by (title, folder_path)
-- so re-running this migration never creates duplicates.
-- All imported records: client_id NULL (no client-tracking existed in the
-- source), status NOT_STARTED (archival backfill, not active work),
-- content_logged_at NULL (nobody has reviewed these numbers in-app yet).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Storage devices referenced by the spreadsheet
INSERT INTO public.storage_devices (label, type, capacity)
VALUES
  ('WK 2TB 01', 'HDD', '2TB'),
  ('WK 2TB 02', 'HDD', '2TB'),
  ('WK HDD 03', 'HDD', 'HDD'),
  ('WK 4TB 01', 'HDD', '4TB')
ON CONFLICT DO NOTHING;

-- 2. Media records stored on WK 2TB 01
DO $$
DECLARE
  d_2tb01 uuid;
  d_2tb02 uuid;
  d_hdd03 uuid;
  d_4tb01 uuid;
BEGIN
  SELECT id INTO d_2tb01 FROM public.storage_devices WHERE label = 'WK 2TB 01' LIMIT 1;
  SELECT id INTO d_2tb02 FROM public.storage_devices WHERE label = 'WK 2TB 02' LIMIT 1;
  SELECT id INTO d_hdd03 FROM public.storage_devices WHERE label = 'WK HDD 03' LIMIT 1;
  SELECT id INTO d_4tb01 FROM public.storage_devices WHERE label = 'WK 4TB 01' LIMIT 1;

  -- Skip entirely if this migration already ran (first row as sentinel).
  IF EXISTS (
    SELECT 1 FROM public.media_records
    WHERE title = 'Harshitha Puberty 24.5.2026'
      AND folder_path = 'WANDERING KITE/WK Weddings & Events/Harshitha Puberty 24.5.2026'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.media_records
    (title, folder_path, content_tags, primary_storage_device_id, original_backup_device_id, backup_copy_device_id, shoot_date, photo_size_gb, video_size_gb, status, notes)
  VALUES
    ('Harshitha Puberty 24.5.2026', 'WANDERING KITE/WK Weddings & Events/Harshitha Puberty 24.5.2026',
      ARRAY['DJI Pocket','Tradional Video'], d_2tb01, d_2tb02, d_4tb01, '2026-05-24', 0, 482.63, 'NOT_STARTED', NULL),

    ('RACHANAA PUBERTY 26-04-2026', 'WANDERING KITE/WK Weddings & Events/RACHANAA PUBERTY 26-04-2026',
      ARRAY['Candid Video','DJI Pocket','Rachana Bts','song'], d_2tb01, d_2tb02, d_4tb01, '2026-04-26', 0, 406.59, 'NOT_STARTED', NULL),

    ('Saravana + Hema 24&25th March 26', 'WANDERING KITE/WK Weddings & Events/Saravana + Hema 24&25th March 26',
      ARRAY['Candid Video','Candid photo','Traditional photos','Traditional Video'], d_2tb01, d_2tb02, d_4tb01, '2026-03-25', 0, 326.81, 'NOT_STARTED', NULL),

    ('Vedha Puberty 7.5.2026', 'WANDERING KITE/WK Weddings & Events/Vedha Puberty 7.5.2026',
      ARRAY['DJi Pocket','PROJ PP','Video'], d_2tb01, d_2tb02, d_4tb01, '2026-06-08', 0, 99.06, 'NOT_STARTED', NULL),

    ('Studio Space Influencer Reel', 'WANDERING KITE/Studio Space Influencer Reel',
      ARRAY['BTS','FX3','M5','Proj PP'], d_2tb01, NULL, NULL, '2026-05-06', 0, 45.86, 'NOT_STARTED', NULL),

    ('Unacademy Bts Videos', 'WANDERING KITE/Unacademy Bts Videos',
      ARRAY[]::text[], d_2tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', NULL),

    ('Pratyagra Interview', NULL,
      ARRAY[]::text[], d_2tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', NULL),

    ('Thirumurugan singer photoshoot on studio space', 'WANDERING KITE/Review Reel/Thirumurugan Singers Shoot',
      ARRAY[]::text[], NULL, NULL, NULL, '2026-07-08', 0, 0, 'NOT_STARTED', NULL),

    ('Pratyagra Influencer Reel 11.07.2026', 'WANDERING KITE/Pratyagra Influencer Reel 11.07.2026',
      ARRAY[]::text[], NULL, NULL, NULL, '2026-07-11', 0, 0, 'NOT_STARTED', NULL),

    ('Arun Cinematographer Review Reel', 'WK 2TB 01/Review Reel/Arun Cinematographer',
      ARRAY['FX3','Final','Fx 3 1','Musics','Pocket','X5'], d_2tb01, NULL, NULL, '2026-04-12', 0, 49.31, 'NOT_STARTED', 'Review Reel and BTS'),

    ('Karthick Era Review Reel', 'WK 2TB 01/Review Reel/Karthick Era',
      ARRAY['Final','Footage','Proj pp'], d_2tb01, NULL, NULL, '2026-04-20', 0, 8.82, 'NOT_STARTED', 'Review Reel'),

    ('Kesavan Review Reel', 'WK 2TB 01/Review Reel/Kesavan',
      ARRAY['Final','Fooatge'], d_2tb01, NULL, NULL, '2026-04-10', 0, 4.48, 'NOT_STARTED', 'Review Reel'),

    ('Manikandan Review Reel', 'WK 2TB 01/Review Reel/Manikandan review',
      ARRAY['BTS','Footage'], d_2tb01, NULL, NULL, '2026-04-16', 0, 16.45, 'NOT_STARTED', 'Review Reel'),

    ('Mithun Director Review and BTS', 'WK 2TB 01/Review Reel/Mithun Director',
      ARRAY['BTS','CLIP','Final','Proj PP'], d_2tb01, NULL, NULL, '2026-04-15', 0, 84.35, 'NOT_STARTED', 'Review Reel and BTS'),

    ('Plip Plip Review', 'WK 2TB 01/Review Reel/Plip Plip review',
      ARRAY['Clips','Final','Musics'], d_2tb01, NULL, NULL, '2026-04-16', 0, 2.49, 'NOT_STARTED', 'Review Reel and BTS'),

    ('Sathya jith hoot', 'WK 2TB 01/Review Reel/Sathya jith shoot',
      ARRAY['Sathyajith music video shoot 1','Sathyajith music video shoot 2'], d_2tb01, NULL, NULL, '2026-04-15', 0, 46.22, 'NOT_STARTED', 'Photoshoot'),

    ('Straight Outta Kovai', 'WK 2TB 01/Review Reel/Strait Outta Kovai',
      ARRAY['BTS','Final','Final Out','FX 03','Musics'], d_2tb01, NULL, NULL, '2026-05-05', 0, 9.51, 'NOT_STARTED', 'Review Reel and BTS'),

    ('Suriya Prakash', 'WK 2TB 01/Review Reel/Suriya prakash',
      ARRAY['BTS','Review'], d_2tb01, NULL, NULL, '2026-04-19', 0, 13.19, 'NOT_STARTED', 'Review Reel and BTS'),

    ('Jithu Review', 'WK 2TB 01/Review Reel/JITHU review.mp4',
      ARRAY['JITHU review.mp4'], d_2tb01, NULL, NULL, '2026-04-15', 0, 0.537, 'NOT_STARTED', 'Review Reel'),

    ('Interior Images', 'WK 2TB 01/Studio Space/Interior Images',
      ARRAY['JPEG','RAW','Wandering Kite Interior Lr'], d_2tb01, NULL, NULL, '2026-05-02', 3.89, 0, 'NOT_STARTED', 'Interior Images'),

    ('Murugan Baby Shoot', 'WK 2TB 01/Studio Space/Murugan Baby Shoot',
      ARRAY['Photos','Video'], d_2tb01, NULL, NULL, '2026-06-02', 0, 8.11, 'NOT_STARTED', 'Review Reel and BTS'),

    ('XLU & Pratyagra Skils Interior Images', 'WK 2TB 01/Studio Space/XLU & Pratyagra Skils Interior Images',
      ARRAY['RAW','Final','XLU and Pratyagra Lr files'], d_2tb01, NULL, NULL, '2026-05-13', 6.08, 0, 'NOT_STARTED', 'Interior Images'),

    ('14.02.2026 Kozhinchampara House Worming Annapoorani', 'WK 2TB 01/Wandering Kite Studio/WK Albums & Photo Frame/14.02.2026 Kozhinchampara House Worming Annapoorani',
      ARRAY['Album Sheets','Final','House Warming Lr','Smart Album File','RAW','Final Pdf'], d_2tb01, NULL, NULL, '2026-02-14', 10.55, 0, 'NOT_STARTED', 'House warming album'),

    ('NKAB Mettupalayam(05-01-2026)', 'WK 2TB 01/Wandering Kite Studio/WK Corporates/NKAB Mettupalayam(05-01-2026)',
      ARRAY['Drone','Insta 360','photos','Videos'], d_2tb01, NULL, NULL, '2026-01-06', 0, 292.82, 'NOT_STARTED', 'Corporate Video'),

    ('Alusea', 'WK 2TB 01/Wandering Kite Studio/WK Corporates/Alusea',
      ARRAY['Alusea 1st shoot','Influencer Shoot','Interior images'], d_2tb01, NULL, NULL, '2026-04-20', 72.04, 0, 'NOT_STARTED', 'Corporate Photos'),

    ('Kandangi silks', 'WK 2TB 01/Wandering Kite Studio/WK Corporates/Kandangi silks',
      ARRAY['Building Elevation','Final','Kandangi silks LR','New Out','Raw'], d_2tb01, NULL, NULL, '2026-05-08', 0, 22.36, 'NOT_STARTED', 'Product and interior shoot'),

    ('Nihaa Jewels', 'WK 2TB 01/Wandering Kite Studio/WK Corporates/Nihaa Jewels',
      ARRAY['Nihaa Jewels Lr','Output','Raw'], d_2tb01, NULL, NULL, '2026-06-09', 3.64, 0, 'NOT_STARTED', 'Interior Images'),

    ('Nooladai Shoot', 'WK 2TB 01/Wandering Kite Studio/WK Corporates/Nooladai Shoot',
      ARRAY['12-01-2026','13-01-2026','DJI Pocket','Efeects','Insta 360','Musics','Nooladai Logo','Proj PP'], d_2tb01, NULL, NULL, '2026-01-12', 0, 165.06, 'NOT_STARTED', 'Product Shoot'),

    ('Office Opening', 'WK 2TB 01/Wandering Kite Studio/WK Corporates/Office Opening',
      ARRAY['Dji Pocket','Final','FX3','Musics','Proj PP'], d_2tb01, d_2tb02, NULL, '2026-04-14', 0, 86.17, 'NOT_STARTED', 'Inauguration'),

    ('Pratyagra Silks', 'WK 2TB 01/Wandering Kite Studio/WK Corporates',
      ARRAY['Influencer Shoot','Jacket Photo','LOGOs','Pongal Reel','Pratyagra Designer Wedding Photos','Pratyagra silks 4','Pratyagra silks 5','Pratyagra silks 6','Pratyagra silks 7','Pratyagra silks 8','Pratyagra silks 9','Pratyagra Designer 1','Pratyagra Designer 2'],
      d_2tb01, d_2tb02, NULL, '2026-01-11', 622.56, 0, 'NOT_STARTED', 'Product Shoot'),

    ('Pratyagra Sliks Story', 'WK 2TB 01/Wandering Kite Studio/WK Corporates/Pratyagra Sliks Story',
      ARRAY['Stry Of pratyagra','Thanks Giving Reel'], d_2tb01, NULL, NULL, '2026-04-24', 0, 17.53, 'NOT_STARTED', NULL),

    ('Guru & Gauri House Warming 29/05/2026', 'WK 2TB 01/Wandering Kite Studio/WK Events/Guru & Gauri House Warming 29-05-2026',
      ARRAY['Guru & Gauri House warming lr files','Output','RAW'], d_2tb01, NULL, NULL, '2026-05-29', 25.56, 0, 'NOT_STARTED', 'House warming'),

    ('WK logo', 'WK 2TB 01/Wandering Kite Studio/WK logo',
      ARRAY[]::text[], d_2tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', NULL),

    ('Nowfal + Shifa', 'WK 2TB 01/Wandering Kite Studio/WK Weddings/Nowfal + Shifa',
      ARRAY['Final Out','Mahesh(2)','Meha(1)','Nouful & Shifa Wedding album'], d_2tb01, NULL, NULL, '2025-12-03', 0, 140.94, 'NOT_STARTED', 'Wedding'),

    ('Reavanth & Athiraa Wedding', 'WK 2TB 01/Wandering Kite Studio/WK Weddings/Reavanth & Athiraa Wedding',
      ARRAY['Candid Photo','Traditional Photo','RAW','Raevanth & Athiraa Wedding Lr Files'], d_2tb01, d_hdd03, NULL, '2026-06-25', 595.32, 0, 'NOT_STARTED', 'Wedding'),

    ('Raevanth & Athiraa Wedding Tradional Photo', 'WK HDD 03/Wandering Kite/WK Weddings/Raevanth & Athira Wedding/Tradtional Photo',
      ARRAY['RAW','Raevanth & Athiraa Wedding Lr Files'], d_hdd03, NULL, NULL, NULL, 131.3, 0, 'NOT_STARTED', 'Wedding');

END $$;
