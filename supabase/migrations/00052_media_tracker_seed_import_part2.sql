-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — historical import from "Copy of Wandering Kite DB Tracker"
-- Part 2 of 2 (see 00051 for storage devices + WK 2TB 01 records). This
-- migration covers every record physically stored on WK 2TB 02 (page 4 of
-- the source) plus the WK 4TB 01 backup-index-only entries (page 5) that
-- have no other detail row.
-- Idempotent: records matched by (title, folder_path) so re-running this
-- migration never creates duplicates.
-- All imported records: client_id NULL (no client-tracking existed in the
-- source), status NOT_STARTED (archival backfill, not active work),
-- content_logged_at NULL (nobody has reviewed these numbers in-app yet).
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  d_2tb02 uuid;
  d_4tb01 uuid;
BEGIN
  SELECT id INTO d_2tb02 FROM public.storage_devices WHERE label = 'WK 2TB 02' LIMIT 1;
  SELECT id INTO d_4tb01 FROM public.storage_devices WHERE label = 'WK 4TB 01' LIMIT 1;

  -- Skip entirely if this migration already ran (first row as sentinel).
  IF EXISTS (
    SELECT 1 FROM public.media_records
    WHERE title = 'Bharathanatyam Shoot Review'
      AND folder_path = 'WK 2TB 02/Studio Space/Review Reel/Bharthanatyam Shoot Review'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.media_records
    (title, folder_path, content_tags, primary_storage_device_id, original_backup_device_id, backup_copy_device_id, shoot_date, photo_size_gb, video_size_gb, status, notes)
  VALUES
    ('Bharathanatyam Shoot Review', 'WK 2TB 02/Studio Space/Review Reel/Bharthanatyam Shoot Review',
      ARRAY['clip'], d_2tb02, NULL, NULL, '2026-06-17', 0, 6.86, 'NOT_STARTED', 'Review Reel'),

    ('Lycan vision review', 'WK 2TB 02/Studio Space/Review Reel/Lycan vision review',
      ARRAY['Clips','Dji','Final Out','Music','Proj PP','Videos'], d_2tb02, NULL, NULL, '2026-06-18', 0, 19.86, 'NOT_STARTED', 'Review Reel'),

    ('Clips Of Product Shoot', 'WK 2TB 02/Studio Space',
      ARRAY['Clips'], d_2tb02, NULL, NULL, '2026-05-08', 0, 0.869, 'NOT_STARTED', 'BTS'),

    ('Book Of Record Baby', 'WK 2TB 02/Studio Space/Review Reel',
      ARRAY['Video'], d_2tb02, NULL, NULL, '2026-06-15', 0, 1.88, 'NOT_STARTED', 'Review Reel'),

    ('Productions by MP review', 'WK 2TB 02/Studio Space/Review Reel/Productions by MP review',
      ARRAY['Assets','final Out','project File proxy','Rapper Poster Shoot','Songs','Videos'], d_2tb02, NULL, NULL, '2026-06-06', 0, 8.89, 'NOT_STARTED', 'Review Reel'),

    ('Strait Outta Kovai (Studio Space copy)', 'WK 2TB 02/Studio Space',
      ARRAY['BTS','Final','FX 03','Musics','WK Studio Space Reel 01 Masks'], d_2tb02, NULL, NULL, '2026-05-05', 0, 10.59, 'NOT_STARTED', 'Review Reel and BTS'),

    ('Model Review', 'WK 2TB 02/Studio Space/Review Reel/Model Review',
      ARRAY['CLIPs'], d_2tb02, NULL, NULL, '2026-06-24', 0, 0.397, 'NOT_STARTED', 'Review Reel'),

    ('UN Academy Review', 'WK 2TB 02/Studio Space/Review Reel',
      ARRAY['Clips','Music'], d_2tb02, NULL, NULL, '2026-05-07', 0, 4.56, 'NOT_STARTED', 'Review Reel'),

    ('Thread To Web Reel', 'WK 2TB 02/Studio Space/Thread To Web Reel',
      ARRAY['Clips','Final Out','Proj PP','Stock Image'], d_2tb02, NULL, NULL, '2026-07-06', 0, 3.47, 'NOT_STARTED', 'Corporate Reel'),

    ('Amberesh Appa LIfe', 'WK 2TB 02/Wandering Kite/WK Corporate/Amberesh Appa LIfe',
      ARRAY['Bracelet Shot','Footage','PROJ PP'], d_2tb02, NULL, NULL, '2026-05-11', 0, 181.73, 'NOT_STARTED', 'Lifestyle Video'),

    ('Director shoot BTS', 'WK 2TB 02/Wandering Kite/WK Corporate/Director shoot BTS',
      ARRAY['Clips'], d_2tb02, NULL, NULL, '2026-04-25', 0, 8.86, 'NOT_STARTED', 'BTS'),

    ('Pratyagra Silks (WK 2TB 02 copy)', 'WK 2TB 02/Wandering Kite/WK Corporate/Pratyagra Silks',
      ARRAY['Bts Reels','Influencer Shoot','LOGOs','Pratyagra shoot 5','Pratyagra Silks 7','Pratyagra Silks 8','Pratyagra Silks 9','Pratyagra Silks Designer 01','Pratyagra Silks Designer 02','Pratyagra Silks Story'],
      d_2tb02, NULL, NULL, '2026-03-27', 278.48, 0, 'NOT_STARTED', 'Product Shoot'),

    ('Harshitha Puberty 24.5.2026 (WK 2TB 02 copy)', 'WK 2TB 02/Wandering Kite/WK Weddings & Events/Harshitha Puberty 24.5.2026',
      ARRAY['DJI Pocket','Tradional Video'], d_2tb02, NULL, NULL, '2026-05-25', 0, 482.63, 'NOT_STARTED', 'Puberty'),

    ('Office Opening (WK 2TB 02 copy)', 'WK 2TB 02/Wandering Kite/WK Weddings & Events/Office Opening',
      ARRAY['FX3','M3','M4','Out','Office Opening Photos LR'], d_2tb02, NULL, NULL, '2026-04-14', 0, 30.41, 'NOT_STARTED', 'Inauguration'),

    ('RACHANAA PUBERTY 26-04-2026 (WK 2TB 02 copy)', 'WK 2TB 02/Wandering Kite/WK Weddings & Events/RACHANAA PUBERTY 26-04-2026',
      ARRAY['Candid Video - FX3','DJI Pocket','Rachana Bts','song'], d_2tb02, NULL, NULL, '2026-04-26', 0, 406.59, 'NOT_STARTED', 'Puberty'),

    ('Saravana + Hema 24&25th March 26 (WK 2TB 02 copy)', 'WK 2TB 02/Wandering Kite/WK Weddings & Events/Saravana + Hema 24&25th March 26',
      ARRAY['Candid Video','Candid photo','Traditional photos','Traditional Video'], d_2tb02, NULL, NULL, '2026-03-25', 0, 326.81, 'NOT_STARTED', 'Wedding'),

    ('Vedha Puberty 7.5.2026 (WK 2TB 02 copy)', 'WK 2TB 02/Wandering Kite/WK Weddings & Events/Vedha Puberty 7.5.2026',
      ARRAY['DJi Pocket','PROJ PP','Video'], d_2tb02, NULL, NULL, '2026-06-08', 0, 99.06, 'NOT_STARTED', 'Puberty'),

    ('Templates', 'WK 2TB 02/Templates',
      ARRAY['Channa Mereya Full Video - ADHM_Ranbir Kapoor, Anushka_Arijit Singh_Pritam_Karan Johar - YouTube_files'],
      d_2tb02, NULL, NULL, NULL, 0, 0.0319, 'NOT_STARTED', 'Templates'),

    ('LUTs', 'WK 2TB 02/LUTs',
      ARRAY['Sanjithadesigns - 50 Free Luts'], d_2tb02, NULL, NULL, '2026-05-21', 0, 0.199, 'NOT_STARTED', 'LUT'),

    ('Bridal Shoot Review Reel', 'WK 2TB 02/Studio Space/Review Reel/Bridal Shoot Review Reel',
      ARRAY['CLIPS'], d_2tb02, NULL, NULL, '2026-07-02', 0, 9.61, 'NOT_STARTED', 'Review Reel'),

    ('muthu Review', 'WK 2TB 02/Studio Space/Review Reel/muthu Review',
      ARRAY['Clips'], d_2tb02, NULL, NULL, '2026-07-04', 0, 3.16, 'NOT_STARTED', 'Review Reel'),

    ('BNI 24.04.26', 'WK 2TB 02/Wandering Kite/WK Corporate/BNI 24.04.2026 Coffee Table',
      ARRAY['Assets','DJI','Musics','Photos','Proj PP'], d_2tb02, NULL, NULL, '2026-04-24', 0, 19.21, 'NOT_STARTED', 'CorporateVideo'),

    -- 4TB backup-index-only entries (no other detail row exists for these)
    ('Sathya Stills', NULL, ARRAY[]::text[], d_4tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', 'Backed up on WK 4TB 01'),
    ('Short Fim(Raghav Anna)', NULL, ARRAY[]::text[], d_4tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', 'Backed up on WK 4TB 01'),
    ('Vickey DM', NULL, ARRAY[]::text[], d_4tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', 'Backed up on WK 4TB 01'),
    ('Barani Wedding', NULL, ARRAY[]::text[], d_4tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', 'Backed up on WK 4TB 01'),
    ('Poorni Mam files', NULL, ARRAY[]::text[], d_4tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', 'Backed up on WK 4TB 01'),
    ('Puberty Kabi Bro', NULL, ARRAY[]::text[], d_4tb01, NULL, NULL, NULL, 0, 0, 'NOT_STARTED', 'Backed up on WK 4TB 01');

END $$;
