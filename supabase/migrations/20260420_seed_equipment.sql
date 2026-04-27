-- ============================================================
-- Equipment Seed — WanderingKite Studio Inventory
-- Source: Studio purchase invoice (Apr 2026)
-- Run in Supabase SQL editor (service-role context)
-- ============================================================

-- ── 0. Helpers ────────────────────────────────────────────────────────────────
-- We resolve categoryId and branchId by name so the script is idempotent
-- regardless of the UUID values already in the DB.

-- ── 1. Ensure categories exist ────────────────────────────────────────────────
INSERT INTO categories (id, name, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Camera',           now(), now()),
  (gen_random_uuid(), 'Lens',             now(), now()),
  (gen_random_uuid(), 'Lighting',         now(), now()),
  (gen_random_uuid(), 'Audio',            now(), now()),
  (gen_random_uuid(), 'Tripod & Support', now(), now()),
  (gen_random_uuid(), 'Camera Bag',       now(), now()),
  (gen_random_uuid(), 'Memory & Storage', now(), now()),
  (gen_random_uuid(), 'Battery & Power',  now(), now()),
  (gen_random_uuid(), 'Accessories',      now(), now()),
  (gen_random_uuid(), 'Hard Case',        now(), now()),
  (gen_random_uuid(), 'Gimbal',           now(), now()),
  (gen_random_uuid(), 'Cables & Adapters',now(), now()),
  (gen_random_uuid(), 'Earphone',         now(), now()),
  (gen_random_uuid(), 'Spike Buster',     now(), now())
ON CONFLICT (name) DO NOTHING;

-- ── 2. Ensure default branch exists ──────────────────────────────────────────
INSERT INTO branches (id, name, location, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Main Studio', 'Coimbatore', now(), now())
ON CONFLICT (name) DO NOTHING;

-- ── 3. Seed equipment ────────────────────────────────────────────────────────
-- Pattern: resolve category/branch UUIDs inline via sub-select.
-- serialNumber uses item name slug + index (update with real serials when known).

DO $$
DECLARE
  v_branch   uuid;

  -- category IDs
  c_camera   uuid;
  c_lens     uuid;
  c_light    uuid;
  c_audio    uuid;
  c_tripod   uuid;
  c_bag      uuid;
  c_memory   uuid;
  c_battery  uuid;
  c_access   uuid;
  c_hcase    uuid;
  c_gimbal   uuid;
  c_cable    uuid;
  c_earphone uuid;
  c_spike    uuid;

BEGIN
  -- Resolve branch
  SELECT id INTO v_branch FROM branches WHERE name = 'Main Studio' LIMIT 1;

  -- Resolve categories
  SELECT id INTO c_camera   FROM categories WHERE name = 'Camera'            LIMIT 1;
  SELECT id INTO c_lens     FROM categories WHERE name = 'Lens'              LIMIT 1;
  SELECT id INTO c_light    FROM categories WHERE name = 'Lighting'          LIMIT 1;
  SELECT id INTO c_audio    FROM categories WHERE name = 'Audio'             LIMIT 1;
  SELECT id INTO c_tripod   FROM categories WHERE name = 'Tripod & Support'  LIMIT 1;
  SELECT id INTO c_bag      FROM categories WHERE name = 'Camera Bag'        LIMIT 1;
  SELECT id INTO c_memory   FROM categories WHERE name = 'Memory & Storage'  LIMIT 1;
  SELECT id INTO c_battery  FROM categories WHERE name = 'Battery & Power'   LIMIT 1;
  SELECT id INTO c_access   FROM categories WHERE name = 'Accessories'       LIMIT 1;
  SELECT id INTO c_hcase    FROM categories WHERE name = 'Hard Case'         LIMIT 1;
  SELECT id INTO c_gimbal   FROM categories WHERE name = 'Gimbal'            LIMIT 1;
  SELECT id INTO c_cable    FROM categories WHERE name = 'Cables & Adapters' LIMIT 1;
  SELECT id INTO c_earphone FROM categories WHERE name = 'Earphone'          LIMIT 1;
  SELECT id INTO c_spike    FROM categories WHERE name = 'Spike Buster'      LIMIT 1;

  -- ── CAMERAS ────────────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Video Camera Sony ILME FX-3 5502264',
     'SONY-FX3-5502264', c_camera, v_branch, 4500, 22000, 'AVAILABLE',
     'Sony ILME FX-3 Cinema Line full-frame camera', '[]', now(), now()),

    (gen_random_uuid(), 'Action Camera Insta360 One X2 Essentials Bundle AHEA2510HC6TH',
     'INSTA360-X2-AHEA2510HC6TH', c_camera, v_branch, 800, 4000, 'AVAILABLE',
     'Insta360 One X2 360° action camera essentials bundle', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── LENSES ────────────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Sony G Master SEL85F14GM 1920409',
     'SONY-SEL85-1920409', c_lens, v_branch, 1500, 7500, 'AVAILABLE',
     'Sony FE 85mm f/1.4 GM prime lens', '[]', now(), now()),

    (gen_random_uuid(), 'Sony SEL35F14GM/Q SYX 1977686',
     'SONY-SEL35-1977686', c_lens, v_branch, 1500, 7500, 'AVAILABLE',
     'Sony FE 35mm f/1.4 GM prime lens', '[]', now(), now()),

    (gen_random_uuid(), 'Sony SEL50F14GM C SYX 6839935',
     'SONY-SEL50-6839935', c_lens, v_branch, 1500, 7500, 'AVAILABLE',
     'Sony FE 50mm f/1.4 GM prime lens', '[]', now(), now()),

    (gen_random_uuid(), 'Sigma AF 24-70mm F2.8 DG DN (A) F Sony F92278904',
     'SIGMA-2470-F92278904', c_lens, v_branch, 1200, 6000, 'AVAILABLE',
     'Sigma 24-70mm f/2.8 DG DN Art lens for Sony E-mount', '[]', now(), now()),

    (gen_random_uuid(), 'Sony SEL2F14GM 1943843',
     'SONY-SEL2F14-1943843', c_lens, v_branch, 1500, 7500, 'AVAILABLE',
     'Sony FE 20mm f/1.4 GM wide-angle prime lens', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── LIGHTING ──────────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'LED Light-O Nanlii Mixwand 18 II RGB Light Wand with Bandoor',
     'NANLII-MIXWAND18II-001', c_light, v_branch, 700, 3500, 'AVAILABLE',
     'Nanlii Mixwand 18 II RGB LED wand light with Bandoor attachment', '[]', now(), now()),

    (gen_random_uuid(), 'Flash Godox AD600 Pro II',
     'GODOX-AD600PROII-001', c_light, v_branch, 1200, 6000, 'AVAILABLE',
     'Godox AD600 Pro II outdoor flash strobe 600Ws', '[]', now(), now()),

    (gen_random_uuid(), 'Flash Godox AD-200 Pro II G250403855/G250403867',
     'GODOX-AD200-G250403855', c_light, v_branch, 800, 4000, 'AVAILABLE',
     'Godox AD200 Pro II pocket flash unit (unit 1)', '[]', now(), now()),

    (gen_random_uuid(), 'Flash Godox AD-200 Pro II G250403855/G250403867 (2)',
     'GODOX-AD200-G250403867', c_light, v_branch, 800, 4000, 'AVAILABLE',
     'Godox AD200 Pro II pocket flash unit (unit 2)', '[]', now(), now()),

    (gen_random_uuid(), 'Softbox Godox (BT) Gold 45x45cm WEW-F36 35169',
     'GODOX-SB-WEW36-35169', c_light, v_branch, 300, 1500, 'AVAILABLE',
     'Godox Softbox BT Gold 45×45cm with bowens mount', '[]', now(), now()),

    (gen_random_uuid(), 'Flash Go Godox SK400V 5 G250309277 / G250309278',
     'GODOX-SK400V-G250309277', c_light, v_branch, 600, 3000, 'AVAILABLE',
     'Godox SK400V studio flash (unit 1)', '[]', now(), now()),

    (gen_random_uuid(), 'Flash Go Godox SK400V 5 G250309277 / G250309278 (2)',
     'GODOX-SK400V-G250309278', c_light, v_branch, 600, 3000, 'AVAILABLE',
     'Godox SK400V studio flash (unit 2)', '[]', now(), now()),

    (gen_random_uuid(), 'Trigger Godox Light Push Button X1-S G250307929',
     'GODOX-X1S-G250307929', c_light, v_branch, 200, 1000, 'AVAILABLE',
     'Godox X1S wireless flash trigger for Sony', '[]', now(), now()),

    (gen_random_uuid(), 'Softbox Godox SB-GUE60 18% (Qty: 3)',
     'GODOX-SBGUE60-SET3', c_light, v_branch, 400, 2000, 'AVAILABLE',
     'Godox SB-GUE60 60cm octa softbox set of 3', '[]', now(), now()),

    (gen_random_uuid(), 'Reflector Master Cloth Reflector 5IN1 42 Inch 110CM',
     'REFL-5IN1-110CM-001', c_light, v_branch, 250, 1200, 'AVAILABLE',
     '5-in-1 reflector 42 inch / 110cm (Qty: 2)', '[]', now(), now()),

    (gen_random_uuid(), 'Continuous Light Godox RGB LC1000R G250497625',
     'GODOX-LC1000R-G250497625', c_light, v_branch, 1000, 5000, 'AVAILABLE',
     'Godox RGB LED continuous light LC1000R', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── AUDIO ──────────────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Microphone Hollyland Lark M2 MIC Combo',
     'HOLLYLAND-LARKM2-001', c_audio, v_branch, 600, 3000, 'AVAILABLE',
     'Hollyland Lark M2 wireless lavalier microphone combo kit', '[]', now(), now()),

    (gen_random_uuid(), 'Microphone Sony ECM-M-CE7',
     'SONY-ECMMCE7-001', c_audio, v_branch, 500, 2500, 'AVAILABLE',
     'Sony ECM-M-CE7 multi-directional microphone', '[]', now(), now()),

    (gen_random_uuid(), 'Microphone Sony ECM-M-CE7 (2)',
     'SONY-ECMMCE7-002', c_audio, v_branch, 500, 2500, 'AVAILABLE',
     'Sony ECM-M-CE7 multi-directional microphone (unit 2)', '[]', now(), now()),

    (gen_random_uuid(), 'Earphone Wired-S Sony MDREX15AP Black',
     'SONY-MDREX15AP-001', c_earphone, v_branch, 100, 500, 'AVAILABLE',
     'Sony MDR-EX15AP wired in-ear earphone — Black', '[]', now(), now()),

    (gen_random_uuid(), 'Earphone Wired Finger S-10',
     'FINGER-S10-EARPHONE-001', c_earphone, v_branch, 100, 500, 'AVAILABLE',
     'Finger S-10 wired earphone', '[]', now(), now()),

    (gen_random_uuid(), 'Earphone Wired Finger S-10 (2)',
     'FINGER-S10-EARPHONE-002', c_earphone, v_branch, 100, 500, 'AVAILABLE',
     'Finger S-10 wired earphone (unit 2)', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── TRIPOD & SUPPORT ──────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Tripod-M(2-5) Simpex Heavy Stand-002 (Qty: 3)',
     'SIMPEX-HEAVYSTAND-SET3', c_tripod, v_branch, 200, 1000, 'AVAILABLE',
     'Simpex Heavy Duty light stand set of 3', '[]', now(), now()),

    (gen_random_uuid(), 'Tripod H(A5) Manfrotto MK055XPROPRO3-BHQ .065 ALU 1 3C Kit Ball He.',
     'MANFROTTO-MK055XPRO3-001', c_tripod, v_branch, 600, 3000, 'AVAILABLE',
     'Manfrotto MK055XPRO3-BHQ aluminium tripod with ball head kit', '[]', now(), now()),

    (gen_random_uuid(), 'Tripod H(A5) Manfrotto MVH500AH',
     'MANFROTTO-MVH500AH-001', c_tripod, v_branch, 500, 2500, 'AVAILABLE',
     'Manfrotto MVH500AH fluid video head tripod', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── GIMBAL ────────────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Camera Gimbal DJI Pocket 3 Creator Combo',
     'DJI-POCKET3-001', c_gimbal, v_branch, 800, 4000, 'AVAILABLE',
     'DJI Pocket 3 Creator Combo 3-axis gimbal camera', '[]', now(), now()),

    (gen_random_uuid(), 'Camera Gimbal DJI RS4 Pro Combo 729CMAJ0093265',
     'DJI-RS4PRO-729CMAJ0093265', c_gimbal, v_branch, 1000, 5000, 'AVAILABLE',
     'DJI RS4 Pro Combo 3-axis camera stabiliser', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── CAMERA BAGS ───────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Camera Bag-Mobius Trendsetter Mark 2 Dack Pack (Qty: 2)',
     'MOBIUS-TRENDSETTER-SET2', c_bag, v_branch, 300, 1500, 'AVAILABLE',
     'Mobius Trendsetter Mark 2 camera backpack set of 2', '[]', now(), now()),

    (gen_random_uuid(), 'Camera Bag-Mobius Manfro1 Camou Tripod 105 (Qty: 2)',
     'MOBIUS-MANFRO1-SET2', c_bag, v_branch, 300, 1500, 'AVAILABLE',
     'Mobius Manfro1 camouflage tripod bag set of 2', '[]', now(), now()),

    (gen_random_uuid(), 'Camera Bag-Mobius SSS Everyday Sling Bag',
     'MOBIUS-SSS-SLING-001', c_bag, v_branch, 250, 1200, 'AVAILABLE',
     'Mobius SSS Everyday camera sling bag', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── MEMORY & STORAGE ─────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Memory Card Sony CEA-Q Series CF Express Type A CEA-G240T/T CE7/24',
     'SONY-CEAG240T-001', c_memory, v_branch, 300, 1500, 'AVAILABLE',
     'Sony CEA-G240T CFexpress Type A memory card (240GB)', '[]', now(), now()),

    (gen_random_uuid(), 'Memory Card Reader Sony MRW-G3/T CE7',
     'SONY-MRWG3-001', c_memory, v_branch, 150, 700, 'AVAILABLE',
     'Sony MRW-G3 CFexpress Type A card reader', '[]', now(), now()),

    (gen_random_uuid(), 'Memory Card Lexar Professional 2000X SDXC UHS-II U3 (Qty: 2)',
     'LEXAR-2000X-SDXC-SET2', c_memory, v_branch, 200, 1000, 'AVAILABLE',
     'Lexar Professional 2000X SDXC UHS-II U3 memory card set of 2', '[]', now(), now()),

    (gen_random_uuid(), 'Memory Card Lexar Micro SDXC V30 Silver Plus 205/150 256GB',
     'LEXAR-V30-SILVER-256GB-001', c_memory, v_branch, 150, 750, 'AVAILABLE',
     'Lexar Micro SDXC V30 Silver Plus 256GB', '[]', now(), now()),

    (gen_random_uuid(), 'Memory Card Lexar Micro SDXC V30 Silver Plus 205/150 256GB (2)',
     'LEXAR-V30-SILVER-256GB-002', c_memory, v_branch, 150, 750, 'AVAILABLE',
     'Lexar Micro SDXC V30 Silver Plus 256GB (unit 2)', '[]', now(), now()),

    (gen_random_uuid(), 'Memory Card Case Lync KH15C',
     'LYNC-KH15C-001', c_memory, v_branch, 50, 250, 'AVAILABLE',
     'Lync KH15C memory card organiser case', '[]', now(), now()),

    (gen_random_uuid(), 'Memory Card Reader Transcend USB 3.0 TS-RDF9K2',
     'TRANSCEND-TSRDF9K2-001', c_memory, v_branch, 100, 500, 'AVAILABLE',
     'Transcend USB 3.0 multi-card reader TS-RDF9K2', '[]', now(), now()),

    (gen_random_uuid(), 'Harddisk External SSD Lexar SL500 R2000W/V1800MB S 2TB (Qty: 2)',
     'LEXAR-SL500-2TB-SET2', c_memory, v_branch, 400, 2000, 'AVAILABLE',
     'Lexar SL500 external SSD 2TB (read 2000MB/s write 1800MB/s) — set of 2', '[]', now(), now()),

    (gen_random_uuid(), 'Harddisk External Weston HDEX 140 (Qty: 2)',
     'WESTON-HDEX140-SET2', c_memory, v_branch, 250, 1250, 'AVAILABLE',
     'Weston HDEX 140 external hard disk set of 2', '[]', now(), now()),

    (gen_random_uuid(), 'Flash Go Godox SK400V G250309277',
     'GODOX-SK4-FLASH-G250309277', c_light, v_branch, 600, 3000, 'AVAILABLE',
     'Godox SK400V studio flash', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── BATTERY & POWER ──────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Battery Li-Ion (FOC) NP-FZ100/J JCE',
     'SONY-NPFZ100-BATT-001', c_battery, v_branch, 150, 750, 'AVAILABLE',
     'Sony NP-FZ100 lithium-ion rechargeable battery', '[]', now(), now()),

    (gen_random_uuid(), 'Battery Li-Ion Wolfcon NP-F980 (10000MAH)',
     'WOLFCON-NPF980-10000MAH', c_battery, v_branch, 200, 1000, 'AVAILABLE',
     'Wolfcon NP-F980 compatible 10000mAh battery', '[]', now(), now()),

    (gen_random_uuid(), 'Flash Go Godox V8601 S M24L048447',
     'GODOX-V860III-M24L048447', c_battery, v_branch, 400, 2000, 'AVAILABLE',
     'Godox V860 III battery-powered camera flash for Sony', '[]', now(), now()),

    (gen_random_uuid(), 'M Adapter Portronics Adapto 45A 45W Wall Charger POR 1244',
     'PORTRONICS-ADAPTO45A-001', c_battery, v_branch, 100, 500, 'AVAILABLE',
     'Portronics Adapto 45A 45W USB-C wall charger', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── ACCESSORIES ──────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'IE Accessories H&Y Filter RNCC82 67 82MM (Qty: 3)',
     'HY-RNCC82-SET3', c_access, v_branch, 200, 1000, 'AVAILABLE',
     'H&Y RNCC82 ND/CPL filter set — 67mm & 82mm (set of 3)', '[]', now(), now()),

    (gen_random_uuid(), 'Camera Accessory MagMod Flash Slide Design Camera Strap ASH1 SL ASH',
     'MAGMOD-CAMSTRAP-ASH1', c_access, v_branch, 150, 750, 'AVAILABLE',
     'MagMod camera strap with flash slide attachment design', '[]', now(), now()),

    (gen_random_uuid(), 'Camera Accessory Insta360 Bullet Time Bundle',
     'INSTA360-BULLETTIMEBUNDLE', c_access, v_branch, 300, 1500, 'AVAILABLE',
     'Insta360 Bullet Time Bundle accessory kit', '[]', now(), now()),

    (gen_random_uuid(), 'Metal Clamp Godox S-2 Bracket',
     'GODOX-S2-BRACKET-001', c_access, v_branch, 100, 500, 'AVAILABLE',
     'Godox S-2 Bowens-mount speedlite bracket / clamp', '[]', now(), now()),

    (gen_random_uuid(), 'Camera Cage Sirui for Sony SCH-FX3/30',
     'SIRUI-SCH-FX3-001', c_access, v_branch, 300, 1500, 'AVAILABLE',
     'Sirui camera cage for Sony FX3/FX30', '[]', now(), now()),

    (gen_random_uuid(), 'Umbrella Umbrella Regular (Qty: 2)',
     'UMBRELLA-REG-SET2', c_access, v_branch, 150, 750, 'AVAILABLE',
     'Photography reflective umbrella set of 2', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── HARD CASES ────────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Casing Hard Disk Protector Saco',
     'SACO-HDDCASE-001', c_hcase, v_branch, 100, 500, 'AVAILABLE',
     'Saco hard disk protector case / sleeve', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── CABLES & ADAPTERS ─────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'I-Cable HDMI Nexttech NC8B USB C to C 1.2MTR 65W',
     'NEXTTECH-NC8B-USBC-001', c_cable, v_branch, 100, 500, 'AVAILABLE',
     'Nexttech NC8B USB-C to USB-C HDMI cable 1.2m 65W (unit 1)', '[]', now(), now()),

    (gen_random_uuid(), 'I-Cable HDMI Nexttech NC8B USB C to C 1.2MTR 65W (2)',
     'NEXTTECH-NC8B-USBC-002', c_cable, v_branch, 100, 500, 'AVAILABLE',
     'Nexttech NC8B USB-C to USB-C HDMI cable 1.2m 65W (unit 2)', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

  -- ── SPIKE BUSTERS ────────────────────────────────────────────────────────
  INSERT INTO equipment (id, name, "serialNumber", "categoryId", "branchId", rental_price, weekly_price, status, description, specs, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'I-Spike Buster Honeywell HC0000001/SRO/2M/BLK/V3 Out Black',
     'HONEYWELL-HC0000001-001', c_spike, v_branch, 150, 750, 'AVAILABLE',
     'Honeywell surge protector 2M / 3 outlets — Black', '[]', now(), now()),

    (gen_random_uuid(), 'I-Spike Buster Honeywell 8 Out Surge Protector HC000010/SRG/M Black',
     'HONEYWELL-HC000010-001', c_spike, v_branch, 200, 1000, 'AVAILABLE',
     'Honeywell 8-outlet surge protector with master switch', '[]', now(), now())

  ON CONFLICT ("serialNumber") DO NOTHING;

END $$;
