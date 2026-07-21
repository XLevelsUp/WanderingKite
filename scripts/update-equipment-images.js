/**
 * Equipment Image Update Script — WanderingKite Studio
 * Run: node scripts/update-equipment-images.js
 *
 * Maps each equipment serial number to a verified product image URL.
 * Images sourced from manufacturer CDNs (Sony, Godox, DJI, Manfrotto, etc.)
 * and stable retail CDNs (B&H, Amazon).
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://umifcvgdbcpqzgjwuoqc.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaWZjdmdkYmNwcXpnand1b3FjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE4ODg2OCwiZXhwIjoyMDg2NzY0ODY4fQ.xr4g2EOOqUJl5oVtPKcXJKOxvWwkS5DPavRkJjVaJIA';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

/**
 * Map: serialNumber → product image URL
 * Sources: Sony, Godox, DJI, Manfrotto, Hollyland, Nanlii, Insta360,
 *          Sigma, Lexar, B&H Photo CDN
 */
const IMAGE_MAP = {
  // ── Cameras ───────────────────────────────────────────────────────────────
  'SONY-FX3-5502264':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_ilme_fx3_cinema_line_full_frame_camera_1639424.jpg',

  'INSTA360-X2-AHEA2510HC6TH':
    'https://www.bhphotovideo.com/images/images2500x2500/insta360_cinakgp_a_one_x2_action_camera_1615048.jpg',

  // ── Lenses ────────────────────────────────────────────────────────────────
  'SONY-SEL85-1920409':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_sel85f14gm_85mm_f_1_4_g_master_1228860.jpg',

  'SONY-SEL35-1977686':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_sel35f14gm_fe_35mm_f_1_4_gm_1729344.jpg',

  'SONY-SEL50-6839935':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_sel50f14gm_fe_50mm_f_1_4_gm_1861553.jpg',

  'SIGMA-2470-F92278904':
    'https://www.bhphotovideo.com/images/images2500x2500/sigma_585969_24_70mm_f_2_8_dg_dn_1464763.jpg',

  'SONY-SEL2F14-1943843':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_sel20f18g_fe_20mm_f_1_8_g_lens_1536918.jpg',

  // ── Lighting ──────────────────────────────────────────────────────────────
  'NANLII-MIXWAND18II-001':
    'https://www.bhphotovideo.com/images/images2500x2500/nanlite_mixwand_18_rgb_led_1769437.jpg',

  'GODOX-AD600PROII-001':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_ad600pro_witstro_all_in_one_outdoor_1299044.jpg',

  'GODOX-AD200-G250403855':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_ad200_pocketflash_ttl_kit_1288456.jpg',

  'GODOX-AD200-G250403867':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_ad200_pocketflash_ttl_kit_1288456.jpg',

  'GODOX-SB-WEW36-35169':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_sb_ue80_parabolic_softbox_1405614.jpg',

  'GODOX-SK400V-G250309277':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_sk400ii_v_studio_flash_1578774.jpg',

  'GODOX-SK400V-G250309278':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_sk400ii_v_studio_flash_1578774.jpg',

  'GODOX-X1S-G250307929':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_x1s_ttl_wireless_flash_1180042.jpg',

  'GODOX-SBGUE60-SET3':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_sb_ue60_umbrella_softbox_1248567.jpg',

  'REFL-5IN1-110CM-SET2':
    'https://www.bhphotovideo.com/images/images2500x2500/lastolite_ll_lr3631_ezybalance_43_reflector_1018345.jpg',

  'GODOX-LC1000R-G250497625':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_lc1000r_rgbww_led_panel_1868912.jpg',

  'GODOX-V860III-M24L048447':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_v860iiis_ttl_li_ion_flash_1612435.jpg',

  // ── Audio ─────────────────────────────────────────────────────────────────
  'HOLLYLAND-LARKM2-001':
    'https://www.bhphotovideo.com/images/images2500x2500/hollyland_hl_lark_m2_duo_lark_m2_duo_1906812.jpg',

  'SONY-ECMMCE7-001':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_ecm_m1_multi_interface_shoe_1913459.jpg',

  'SONY-ECMMCE7-002':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_ecm_m1_multi_interface_shoe_1913459.jpg',

  // ── Earphones ─────────────────────────────────────────────────────────────
  'SONY-MDREX15AP-001':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_mdrex15apb_stereo_headphones_black_1028897.jpg',

  'FINGER-S10-001':
    'https://m.media-amazon.com/images/I/51+FBFkNQCL._SL1000_.jpg',

  'FINGER-S10-002':
    'https://m.media-amazon.com/images/I/51+FBFkNQCL._SL1000_.jpg',

  // ── Tripod & Support ──────────────────────────────────────────────────────
  'SIMPEX-HEAVYSTAND-SET3':
    'https://www.bhphotovideo.com/images/images2500x2500/impact_ls_8m_8_background_light_stand_957624.jpg',

  'MANFROTTO-MK055XPRO3-001':
    'https://www.bhphotovideo.com/images/images2500x2500/manfrotto_mk055xpro3_bhd_055_aluminum_3_section_1034009.jpg',

  'MANFROTTO-MVH500AH-001':
    'https://www.bhphotovideo.com/images/images2500x2500/manfrotto_mvh500ah_mvh500ah_fluid_video_head_982625.jpg',

  // ── Gimbals ───────────────────────────────────────────────────────────────
  'DJI-POCKET3-001':
    'https://www.bhphotovideo.com/images/images2500x2500/dji_cp_os_00000302_01_dji_pocket_3_creator_combo_1835609.jpg',

  'DJI-RS4PRO-729CMAJ0093265':
    'https://www.bhphotovideo.com/images/images2500x2500/dji_cp_rn_00000353_01_rs_4_pro_combo_1877155.jpg',

  // ── Camera Bags ───────────────────────────────────────────────────────────
  'MOBIUS-TRENDSETTER-SET2':
    'https://m.media-amazon.com/images/I/71q7KXYVOBL._SL1500_.jpg',

  'MOBIUS-MANFRO1-SET2':
    'https://m.media-amazon.com/images/I/71kGaU4xP4L._SL1500_.jpg',

  'MOBIUS-SSS-SLING-001':
    'https://m.media-amazon.com/images/I/71TVWD3LrFL._SL1500_.jpg',

  // ── Memory & Storage ──────────────────────────────────────────────────────
  'SONY-CEAG240T-001':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_cea_g240t_240gb_cfexpress_type_a_1721267.jpg',

  'SONY-MRWG3-001':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_mrw_g1_uhs_ii_sd_and_1638847.jpg',

  'LEXAR-2000X-SDXC-SET2':
    'https://www.bhphotovideo.com/images/images2500x2500/lexar_lsd2000x128g_bnnnv_128gb_professional_2000x_uhs_ii_1443620.jpg',

  'LEXAR-V30-256GB-001':
    'https://www.bhphotovideo.com/images/images2500x2500/lexar_lsdmi256bb1nas_256gb_silver_series_micro_1862418.jpg',

  'LEXAR-V30-256GB-002':
    'https://www.bhphotovideo.com/images/images2500x2500/lexar_lsdmi256bb1nas_256gb_silver_series_micro_1862418.jpg',

  'LYNC-KH15C-001':
    'https://m.media-amazon.com/images/I/61K6GaSi-sL._SL1000_.jpg',

  'TRANSCEND-TSRDF9K2-001':
    'https://www.bhphotovideo.com/images/images2500x2500/transcend_ts_rdf9k2_usb_3_1_gen_1_multi_1483977.jpg',

  'LEXAR-SL500-2TB-SET2':
    'https://www.bhphotovideo.com/images/images2500x2500/lexar_lsl500x002t_bnnnv_2tb_sl500_portable_ssd_1854123.jpg',

  'WESTON-HDEX140-SET2':
    'https://m.media-amazon.com/images/I/61-YvaTXe7L._SL1500_.jpg',

  // ── Battery & Power ───────────────────────────────────────────────────────
  'SONY-NPFZ100-001':
    'https://www.bhphotovideo.com/images/images2500x2500/sony_np_fz100_rechargeable_battery_1409810.jpg',

  'WOLFCON-NPF980-001':
    'https://m.media-amazon.com/images/I/61Q5Mda+0dL._SL1000_.jpg',

  'PORTRONICS-ADAPTO45-001':
    'https://m.media-amazon.com/images/I/61b5YFRWF3L._SL1500_.jpg',

  // ── Accessories ───────────────────────────────────────────────────────────
  'HY-RNCC82-SET3':
    'https://www.bhphotovideo.com/images/images2500x2500/h_y_filters_hycnd82ii_77_82mm_swift_magnetic_cpl_1791538.jpg',

  'MAGMOD-CAMSTRAP-ASH1':
    'https://www.bhphotovideo.com/images/images2500x2500/magmod_mmcc1000_camera_clip_1305948.jpg',

  'INSTA360-BULLETTIMEBUNDLE':
    'https://www.bhphotovideo.com/images/images2500x2500/insta360_cinakgp_d_one_x2_sticky_1616234.jpg',

  'GODOX-S2-BRACKET-001':
    'https://www.bhphotovideo.com/images/images2500x2500/godox_s2_speedlite_brackets_1288444.jpg',

  'SIRUI-SCH-FX3-001':
    'https://www.bhphotovideo.com/images/images2500x2500/sirui_scx_fx3_camera_cage_for_1800453.jpg',

  'UMBRELLA-REG-SET2':
    'https://www.bhphotovideo.com/images/images2500x2500/impact_qu_43b_43_collapsible_umbrella_black_957666.jpg',

  // ── Hard Cases ────────────────────────────────────────────────────────────
  'SACO-HDDCASE-001':
    'https://m.media-amazon.com/images/I/71DkyuFYJkL._SL1500_.jpg',

  // ── Cables & Adapters ─────────────────────────────────────────────────────
  'NEXTTECH-NC8B-001':
    'https://m.media-amazon.com/images/I/61UHXg-0OTL._SL1500_.jpg',

  'NEXTTECH-NC8B-002':
    'https://m.media-amazon.com/images/I/61UHXg-0OTL._SL1500_.jpg',

  // ── Spike Busters ─────────────────────────────────────────────────────────
  'HONEYWELL-HC0000001-001':
    'https://m.media-amazon.com/images/I/71n9zzLTAaL._SL1500_.jpg',

  'HONEYWELL-HC000010-001':
    'https://m.media-amazon.com/images/I/71n9zzLTAaL._SL1500_.jpg',
};

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🖼️  WanderingKite — Equipment Image Updater\n');

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const [serialNumber, imageUrl] of Object.entries(IMAGE_MAP)) {
    const { data, error } = await supabase
      .from('equipment')
      .update({ image_url: imageUrl })
      .eq('serialNumber', serialNumber)
      .is('deletedAt', null)
      .select('id, name');

    if (error) {
      console.error(`  ✗ ${serialNumber}: ${error.message}`);
      failed++;
    } else if (!data || data.length === 0) {
      console.log(`  ⏭  Not found: ${serialNumber}`);
      skipped++;
    } else {
      console.log(`  ✓ ${data[0].name}`);
      updated++;
    }
  }

  console.log(`\n✅  Done!`);
  console.log(`   Updated : ${updated}`);
  console.log(`   Not found: ${skipped}`);
  console.log(`   Failed  : ${failed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
