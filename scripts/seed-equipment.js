/**
 * Equipment Seed Script — WanderingKite Studio
 * Run: node scripts/seed-equipment.js
 *
 * Uses the Supabase service-role key so it bypasses RLS.
 * DB columns are snake_case: serial_number, category_id, branch_id, rental_price.
 * All rental_price values are placeholder INR/day rates — update as needed.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://umifcvgdbcpqzgjwuoqc.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaWZjdmdkYmNwcXpnand1b3FjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE4ODg2OCwiZXhwIjoyMDg2NzY0ODY4fQ.xr4g2EOOqUJl5oVtPKcXJKOxvWwkS5DPavRkJjVaJIA';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORIES = [
  'Camera',
  'Lens',
  'Lighting',
  'Audio',
  'Tripod & Support',
  'Camera Bag',
  'Memory & Storage',
  'Battery & Power',
  'Accessories',
  'Hard Case',
  'Gimbal',
  'Cables & Adapters',
  'Earphone',
  'Spike Buster',
];

const BRANCH_NAME = 'Main Studio';
const BRANCH_LOCATION = 'Coimbatore';

// ─── Equipment list ──────────────────────────────────────────────────────────
// Fields: name, serialNumber, category, rentalPrice, weeklyPrice, description
const EQUIPMENT = [
  // ── Cameras ───────────────────────────────────────────────────────────────
  {
    name: 'Video Camera Sony ILME FX-3 5502264',
    serialNumber: 'SONY-FX3-5502264',
    category: 'Camera',
    rentalPrice: 4500,
    weeklyPrice: 22000,
    description: 'Sony ILME FX-3 Cinema Line full-frame camera',
  },
  {
    name: 'Action Camera Insta360 One X2 Essentials Bundle',
    serialNumber: 'INSTA360-X2-AHEA2510HC6TH',
    category: 'Camera',
    rentalPrice: 800,
    weeklyPrice: 4000,
    description: 'Insta360 One X2 360° action camera essentials bundle',
  },

  // ── Lenses ────────────────────────────────────────────────────────────────
  {
    name: 'Sony G Master SEL85F14GM 1920409',
    serialNumber: 'SONY-SEL85-1920409',
    category: 'Lens',
    rentalPrice: 1500,
    weeklyPrice: 7500,
    description: 'Sony FE 85mm f/1.4 GM prime lens',
  },
  {
    name: 'Sony SEL35F14GM/Q SYX 1977686',
    serialNumber: 'SONY-SEL35-1977686',
    category: 'Lens',
    rentalPrice: 1500,
    weeklyPrice: 7500,
    description: 'Sony FE 35mm f/1.4 GM prime lens',
  },
  {
    name: 'Sony SEL50F14GM C SYX 6839935',
    serialNumber: 'SONY-SEL50-6839935',
    category: 'Lens',
    rentalPrice: 1500,
    weeklyPrice: 7500,
    description: 'Sony FE 50mm f/1.4 GM prime lens',
  },
  {
    name: 'Sigma AF 24-70mm F2.8 DG DN (A) Sony F92278904',
    serialNumber: 'SIGMA-2470-F92278904',
    category: 'Lens',
    rentalPrice: 1200,
    weeklyPrice: 6000,
    description: 'Sigma 24-70mm f/2.8 DG DN Art lens for Sony E-mount',
  },
  {
    name: 'Sony SEL2F14GM 1943843',
    serialNumber: 'SONY-SEL2F14-1943843',
    category: 'Lens',
    rentalPrice: 1500,
    weeklyPrice: 7500,
    description: 'Sony FE 20mm f/1.4 GM wide-angle prime lens',
  },

  // ── Lighting ──────────────────────────────────────────────────────────────
  {
    name: 'Nanlii Mixwand 18 II RGB Light Wand with Bandoor',
    serialNumber: 'NANLII-MIXWAND18II-001',
    category: 'Lighting',
    rentalPrice: 700,
    weeklyPrice: 3500,
    description: 'Nanlii Mixwand 18 II RGB LED wand light with Bandoor attachment',
  },
  {
    name: 'Flash Godox AD600 Pro II',
    serialNumber: 'GODOX-AD600PROII-001',
    category: 'Lighting',
    rentalPrice: 1200,
    weeklyPrice: 6000,
    description: 'Godox AD600 Pro II outdoor flash strobe 600Ws',
  },
  {
    name: 'Flash Godox AD-200 Pro II Unit 1 G250403855',
    serialNumber: 'GODOX-AD200-G250403855',
    category: 'Lighting',
    rentalPrice: 800,
    weeklyPrice: 4000,
    description: 'Godox AD200 Pro II pocket flash (unit 1)',
  },
  {
    name: 'Flash Godox AD-200 Pro II Unit 2 G250403867',
    serialNumber: 'GODOX-AD200-G250403867',
    category: 'Lighting',
    rentalPrice: 800,
    weeklyPrice: 4000,
    description: 'Godox AD200 Pro II pocket flash (unit 2)',
  },
  {
    name: 'Softbox Godox BT Gold 45x45cm WEW-F36 35169',
    serialNumber: 'GODOX-SB-WEW36-35169',
    category: 'Lighting',
    rentalPrice: 300,
    weeklyPrice: 1500,
    description: 'Godox Softbox BT Gold 45×45cm with bowens mount',
  },
  {
    name: 'Flash Godox SK400V Unit 1 G250309277',
    serialNumber: 'GODOX-SK400V-G250309277',
    category: 'Lighting',
    rentalPrice: 600,
    weeklyPrice: 3000,
    description: 'Godox SK400V studio flash (unit 1)',
  },
  {
    name: 'Flash Godox SK400V Unit 2 G250309278',
    serialNumber: 'GODOX-SK400V-G250309278',
    category: 'Lighting',
    rentalPrice: 600,
    weeklyPrice: 3000,
    description: 'Godox SK400V studio flash (unit 2)',
  },
  {
    name: 'Trigger Godox X1-S G250307929',
    serialNumber: 'GODOX-X1S-G250307929',
    category: 'Lighting',
    rentalPrice: 200,
    weeklyPrice: 1000,
    description: 'Godox X1S wireless flash trigger for Sony',
  },
  {
    name: 'Softbox Godox SB-GUE60 Set of 3',
    serialNumber: 'GODOX-SBGUE60-SET3',
    category: 'Lighting',
    rentalPrice: 400,
    weeklyPrice: 2000,
    description: 'Godox SB-GUE60 60cm octa softbox (set of 3)',
  },
  {
    name: 'Reflector 5IN1 42 Inch 110CM Set of 2',
    serialNumber: 'REFL-5IN1-110CM-SET2',
    category: 'Lighting',
    rentalPrice: 250,
    weeklyPrice: 1200,
    description: '5-in-1 reflector 42 inch / 110cm (set of 2)',
  },
  {
    name: 'Continuous Light Godox RGB LC1000R G250497625',
    serialNumber: 'GODOX-LC1000R-G250497625',
    category: 'Lighting',
    rentalPrice: 1000,
    weeklyPrice: 5000,
    description: 'Godox RGB LED continuous light LC1000R',
  },
  {
    name: 'Flash Godox V860 III S M24L048447',
    serialNumber: 'GODOX-V860III-M24L048447',
    category: 'Lighting',
    rentalPrice: 400,
    weeklyPrice: 2000,
    description: 'Godox V860 III battery-powered camera flash for Sony',
  },

  // ── Audio ─────────────────────────────────────────────────────────────────
  {
    name: 'Microphone Hollyland Lark M2 MIC Combo',
    serialNumber: 'HOLLYLAND-LARKM2-001',
    category: 'Audio',
    rentalPrice: 600,
    weeklyPrice: 3000,
    description: 'Hollyland Lark M2 wireless lavalier microphone combo kit',
  },
  {
    name: 'Microphone Sony ECM-M-CE7 Unit 1',
    serialNumber: 'SONY-ECMMCE7-001',
    category: 'Audio',
    rentalPrice: 500,
    weeklyPrice: 2500,
    description: 'Sony ECM-M-CE7 multi-directional microphone (unit 1)',
  },
  {
    name: 'Microphone Sony ECM-M-CE7 Unit 2',
    serialNumber: 'SONY-ECMMCE7-002',
    category: 'Audio',
    rentalPrice: 500,
    weeklyPrice: 2500,
    description: 'Sony ECM-M-CE7 multi-directional microphone (unit 2)',
  },

  // ── Earphones ─────────────────────────────────────────────────────────────
  {
    name: 'Earphone Wired Sony MDREX15AP Black',
    serialNumber: 'SONY-MDREX15AP-001',
    category: 'Earphone',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Sony MDR-EX15AP wired in-ear earphone — Black',
  },
  {
    name: 'Earphone Wired Finger S-10 Unit 1',
    serialNumber: 'FINGER-S10-001',
    category: 'Earphone',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Finger S-10 wired earphone (unit 1)',
  },
  {
    name: 'Earphone Wired Finger S-10 Unit 2',
    serialNumber: 'FINGER-S10-002',
    category: 'Earphone',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Finger S-10 wired earphone (unit 2)',
  },

  // ── Tripod & Support ──────────────────────────────────────────────────────
  {
    name: 'Simpex Heavy Stand Set of 3',
    serialNumber: 'SIMPEX-HEAVYSTAND-SET3',
    category: 'Tripod & Support',
    rentalPrice: 200,
    weeklyPrice: 1000,
    description: 'Simpex heavy duty light stand (set of 3)',
  },
  {
    name: 'Manfrotto MK055XPRO3-BHQ Tripod Kit',
    serialNumber: 'MANFROTTO-MK055XPRO3-001',
    category: 'Tripod & Support',
    rentalPrice: 600,
    weeklyPrice: 3000,
    description: 'Manfrotto MK055XPRO3-BHQ aluminium tripod with ball head kit',
  },
  {
    name: 'Manfrotto MVH500AH Video Head',
    serialNumber: 'MANFROTTO-MVH500AH-001',
    category: 'Tripod & Support',
    rentalPrice: 500,
    weeklyPrice: 2500,
    description: 'Manfrotto MVH500AH fluid video head tripod',
  },

  // ── Gimbal ────────────────────────────────────────────────────────────────
  {
    name: 'DJI Pocket 3 Creator Combo',
    serialNumber: 'DJI-POCKET3-001',
    category: 'Gimbal',
    rentalPrice: 800,
    weeklyPrice: 4000,
    description: 'DJI Pocket 3 Creator Combo 3-axis gimbal camera',
  },
  {
    name: 'DJI RS4 Pro Combo 729CMAJ0093265',
    serialNumber: 'DJI-RS4PRO-729CMAJ0093265',
    category: 'Gimbal',
    rentalPrice: 1000,
    weeklyPrice: 5000,
    description: 'DJI RS4 Pro Combo 3-axis camera stabiliser',
  },

  // ── Camera Bags ───────────────────────────────────────────────────────────
  {
    name: 'Mobius Trendsetter Mark 2 Backpack Set of 2',
    serialNumber: 'MOBIUS-TRENDSETTER-SET2',
    category: 'Camera Bag',
    rentalPrice: 300,
    weeklyPrice: 1500,
    description: 'Mobius Trendsetter Mark 2 camera backpack (set of 2)',
  },
  {
    name: 'Mobius Manfro1 Camou Tripod Bag Set of 2',
    serialNumber: 'MOBIUS-MANFRO1-SET2',
    category: 'Camera Bag',
    rentalPrice: 300,
    weeklyPrice: 1500,
    description: 'Mobius Manfro1 camouflage tripod bag (set of 2)',
  },
  {
    name: 'Mobius SSS Everyday Sling Bag',
    serialNumber: 'MOBIUS-SSS-SLING-001',
    category: 'Camera Bag',
    rentalPrice: 250,
    weeklyPrice: 1200,
    description: 'Mobius SSS Everyday camera sling bag',
  },

  // ── Memory & Storage ──────────────────────────────────────────────────────
  {
    name: 'Sony CEA-G240T CFexpress Type A Card',
    serialNumber: 'SONY-CEAG240T-001',
    category: 'Memory & Storage',
    rentalPrice: 300,
    weeklyPrice: 1500,
    description: 'Sony CEA-G240T CFexpress Type A memory card (240GB)',
  },
  {
    name: 'Sony MRW-G3 Card Reader',
    serialNumber: 'SONY-MRWG3-001',
    category: 'Memory & Storage',
    rentalPrice: 150,
    weeklyPrice: 700,
    description: 'Sony MRW-G3 CFexpress Type A card reader',
  },
  {
    name: 'Lexar Professional 2000X SDXC UHS-II Set of 2',
    serialNumber: 'LEXAR-2000X-SDXC-SET2',
    category: 'Memory & Storage',
    rentalPrice: 200,
    weeklyPrice: 1000,
    description: 'Lexar Professional 2000X SDXC UHS-II U3 memory card (set of 2)',
  },
  {
    name: 'Lexar Micro SDXC V30 Silver 256GB Unit 1',
    serialNumber: 'LEXAR-V30-256GB-001',
    category: 'Memory & Storage',
    rentalPrice: 150,
    weeklyPrice: 750,
    description: 'Lexar Micro SDXC V30 Silver Plus 256GB (unit 1)',
  },
  {
    name: 'Lexar Micro SDXC V30 Silver 256GB Unit 2',
    serialNumber: 'LEXAR-V30-256GB-002',
    category: 'Memory & Storage',
    rentalPrice: 150,
    weeklyPrice: 750,
    description: 'Lexar Micro SDXC V30 Silver Plus 256GB (unit 2)',
  },
  {
    name: 'Lync KH15C Memory Card Case',
    serialNumber: 'LYNC-KH15C-001',
    category: 'Memory & Storage',
    rentalPrice: 50,
    weeklyPrice: 250,
    description: 'Lync KH15C memory card organiser case',
  },
  {
    name: 'Transcend USB 3.0 Card Reader TS-RDF9K2',
    serialNumber: 'TRANSCEND-TSRDF9K2-001',
    category: 'Memory & Storage',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Transcend USB 3.0 multi-card reader TS-RDF9K2',
  },
  {
    name: 'Lexar SL500 External SSD 2TB Set of 2',
    serialNumber: 'LEXAR-SL500-2TB-SET2',
    category: 'Memory & Storage',
    rentalPrice: 400,
    weeklyPrice: 2000,
    description: 'Lexar SL500 external SSD 2TB (R2000/W1800 MB/s) — set of 2',
  },
  {
    name: 'Weston HDEX 140 External HDD Set of 2',
    serialNumber: 'WESTON-HDEX140-SET2',
    category: 'Memory & Storage',
    rentalPrice: 250,
    weeklyPrice: 1250,
    description: 'Weston HDEX 140 external hard disk (set of 2)',
  },

  // ── Battery & Power ───────────────────────────────────────────────────────
  {
    name: 'Sony NP-FZ100 Battery',
    serialNumber: 'SONY-NPFZ100-001',
    category: 'Battery & Power',
    rentalPrice: 150,
    weeklyPrice: 750,
    description: 'Sony NP-FZ100 lithium-ion rechargeable battery',
  },
  {
    name: 'Wolfcon NP-F980 10000mAh Battery',
    serialNumber: 'WOLFCON-NPF980-001',
    category: 'Battery & Power',
    rentalPrice: 200,
    weeklyPrice: 1000,
    description: 'Wolfcon NP-F980 compatible 10000mAh battery pack',
  },
  {
    name: 'Portronics Adapto 45A 45W Wall Charger',
    serialNumber: 'PORTRONICS-ADAPTO45-001',
    category: 'Battery & Power',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Portronics Adapto 45A 45W USB-C wall charger',
  },

  // ── Accessories ───────────────────────────────────────────────────────────
  {
    name: 'H&Y Filter RNCC82 67mm/82mm Set of 3',
    serialNumber: 'HY-RNCC82-SET3',
    category: 'Accessories',
    rentalPrice: 200,
    weeklyPrice: 1000,
    description: 'H&Y RNCC82 ND/CPL filter set — 67mm & 82mm (set of 3)',
  },
  {
    name: 'MagMod Flash Slide Camera Strap ASH1',
    serialNumber: 'MAGMOD-CAMSTRAP-ASH1',
    category: 'Accessories',
    rentalPrice: 150,
    weeklyPrice: 750,
    description: 'MagMod camera strap with flash slide design',
  },
  {
    name: 'Insta360 Bullet Time Bundle',
    serialNumber: 'INSTA360-BULLETTIMEBUNDLE',
    category: 'Accessories',
    rentalPrice: 300,
    weeklyPrice: 1500,
    description: 'Insta360 Bullet Time Bundle accessory kit',
  },
  {
    name: 'Godox S-2 Bowens Bracket',
    serialNumber: 'GODOX-S2-BRACKET-001',
    category: 'Accessories',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Godox S-2 Bowens-mount speedlite bracket / clamp',
  },
  {
    name: 'Sirui Camera Cage for Sony FX3/FX30',
    serialNumber: 'SIRUI-SCH-FX3-001',
    category: 'Accessories',
    rentalPrice: 300,
    weeklyPrice: 1500,
    description: 'Sirui camera cage SCH-FX3/30 for Sony FX3 and FX30',
  },
  {
    name: 'Photography Umbrella Regular Set of 2',
    serialNumber: 'UMBRELLA-REG-SET2',
    category: 'Accessories',
    rentalPrice: 150,
    weeklyPrice: 750,
    description: 'Photography reflective umbrella regular (set of 2)',
  },

  // ── Hard Cases ────────────────────────────────────────────────────────────
  {
    name: 'Saco Hard Disk Protector Case',
    serialNumber: 'SACO-HDDCASE-001',
    category: 'Hard Case',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Saco hard disk protector case / sleeve',
  },

  // ── Cables & Adapters ─────────────────────────────────────────────────────
  {
    name: 'Nexttech NC8B USB-C to C 1.2m 65W Unit 1',
    serialNumber: 'NEXTTECH-NC8B-001',
    category: 'Cables & Adapters',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Nexttech NC8B USB-C to USB-C cable 1.2m 65W (unit 1)',
  },
  {
    name: 'Nexttech NC8B USB-C to C 1.2m 65W Unit 2',
    serialNumber: 'NEXTTECH-NC8B-002',
    category: 'Cables & Adapters',
    rentalPrice: 100,
    weeklyPrice: 500,
    description: 'Nexttech NC8B USB-C to USB-C cable 1.2m 65W (unit 2)',
  },

  // ── Spike Busters ─────────────────────────────────────────────────────────
  {
    name: 'Honeywell Surge Protector 2M 3 Outlet Black',
    serialNumber: 'HONEYWELL-HC0000001-001',
    category: 'Spike Buster',
    rentalPrice: 150,
    weeklyPrice: 750,
    description: 'Honeywell surge protector HC0000001 2M 3 outlets — Black',
  },
  {
    name: 'Honeywell 8 Outlet Surge Protector HC000010',
    serialNumber: 'HONEYWELL-HC000010-001',
    category: 'Spike Buster',
    rentalPrice: 200,
    weeklyPrice: 1000,
    description: 'Honeywell 8-outlet surge protector HC000010 with master switch',
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  WanderingKite Equipment Seed\n');

  // 1. Upsert categories
  console.log('📁  Upserting categories…');
  for (const name of CATEGORIES) {
    const { error } = await supabase
      .from('categories')
      .upsert({ name }, { onConflict: 'name', ignoreDuplicates: true });
    if (error) console.error(`  ✗ Category "${name}":`, error.message);
    else console.log(`  ✓ ${name}`);
  }

  // 2. Ensure branch exists (no unique constraint — check first)
  console.log('\n🏢  Ensuring branch exists…');
  const { data: existingBranches } = await supabase
    .from('branches')
    .select('id, name')
    .eq('name', BRANCH_NAME)
    .limit(1);

  if (!existingBranches || existingBranches.length === 0) {
    const { error: branchErr } = await supabase
      .from('branches')
      .insert({ name: BRANCH_NAME, location: BRANCH_LOCATION });
    if (branchErr) console.error('  ✗', branchErr.message);
    else console.log(`  ✓ Created: ${BRANCH_NAME}`);
  } else {
    console.log(`  ✓ Already exists: ${BRANCH_NAME}`);
  }

  // 3. Fetch category map
  const { data: cats } = await supabase.from('categories').select('id, name');
  const categoryMap = Object.fromEntries((cats || []).map((c) => [c.name, c.id]));

  // 4. Fetch branch id
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .eq('name', BRANCH_NAME)
    .limit(1);
  const branchId = branches?.[0]?.id;
  if (!branchId) {
    console.error('\n❌  Could not resolve branch ID — aborting.');
    process.exit(1);
  }

  // 5. Insert equipment
  console.log('\n📦  Inserting equipment…');
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of EQUIPMENT) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.error(`  ✗ Unknown category "${item.category}" for "${item.name}"`);
      failed++;
      continue;
    }

    const payload = {
      name: item.name,
      serialNumber: item.serialNumber,
      categoryId,
      branchId,
      rentalPrice: item.rentalPrice,
      weekly_price: item.weeklyPrice,
      status: 'AVAILABLE',
      description: item.description,
      image_url: '',
      specs: [],
    };

    const { error } = await supabase
      .from('equipment')
      .insert(payload);

    if (error) {
      if (error.code === '23505') {
        // unique violation — already exists
        console.log(`  ⏭  Skipped (exists): ${item.name}`);
        skipped++;
      } else {
        console.error(`  ✗ Failed: ${item.name} — ${error.message}`);
        failed++;
      }
    } else {
      console.log(`  ✓ ${item.name}`);
      inserted++;
    }
  }

  console.log(`\n✅  Done!`);
  console.log(`   Inserted : ${inserted}`);
  console.log(`   Skipped  : ${skipped}`);
  console.log(`   Failed   : ${failed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
