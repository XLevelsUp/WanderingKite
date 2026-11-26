#!/usr/bin/env node
/**
 * One-time backfill for website images in Supabase Storage (bucket "equipment-images", folders "portfolio" and "blog"):
 *   1. Creates the missing 800px WebP thumbnail next to every original:  name-123.jpg -> name-123.w800.webp
 *      (the admin uploader does this automatically for new uploads; this covers photos uploaded before).
 *   2. Re-uploads originals that are still served with a short cache (Supabase's 1-hour default) with a 1-year
 *      Cache-Control. Same bytes, same path, same URL — only the caching header changes.
 *
 * Usage (from the repo root):
 *   node scripts/generate-thumbnails.mjs            # dry run: prints what it would do, writes nothing
 *   node scripts/generate-thumbnails.mjs --apply    # does it
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (read from apps/marketing/.env.local if not set).
 * Safe to re-run: existing thumbnails and already-long-cached originals are skipped.
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'equipment-images';
const FOLDERS = ['portfolio', 'blog', '']; // '' = bucket root (equipment photos)
const THUMB_WIDTH = 800; // keep in sync with apps/marketing/lib/images.ts and apps/admin/lib/images/thumbnail.ts
const YEAR = '31536000';
const APPLY = process.argv.includes('--apply');

function loadEnv() {
  const file = 'apps/marketing/.env.local';
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const thumbPathFor = (path) => `${path.replace(/\.[a-z0-9]+$/i, '')}.w${THUMB_WIDTH}.webp`;
const isThumb = (name) => /\.w\d+\.webp$/i.test(name);
const isImage = (name) => /\.(jpe?g|png|webp)$/i.test(name);

async function listFolder(folder) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from(BUCKET).list(folder, { limit: 1000, offset });
    if (error) throw new Error(`list ${folder}: ${error.message}`);
    out.push(...data.filter((f) => f.id).map((f) => f.name)); // skip sub-folder entries
    if (data.length < 1000) break;
  }
  return out;
}

const kb = (n) => `${Math.round(n / 1024)} KB`;
let made = 0, recached = 0, before = 0, after = 0, failed = 0;

console.log(APPLY ? 'APPLY mode — writing to storage.\n' : 'DRY RUN — nothing will be written. Re-run with --apply to do it.\n');

for (const folder of FOLDERS) {
  const names = await listFolder(folder);
  const existing = new Set(names);
  const originals = names.filter((n) => isImage(n) && !isThumb(n));
  console.log(`${folder || '(root)'}/: ${originals.length} originals, ${names.filter(isThumb).length} thumbnails already present`);

  for (const name of originals) {
    const path = folder ? `${folder}/${name}` : name;
    const thumbName = thumbPathFor(name);
    const publicUrl = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    try {
      const res = await fetch(publicUrl);
      if (!res.ok) throw new Error(`download ${res.status}`);
      const cache = res.headers.get('cache-control') ?? '';
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') ?? 'image/jpeg';

      if (!existing.has(thumbName)) {
        const thumb = await sharp(buf).rotate().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
        before += buf.length;
        after += thumb.length;
        console.log(`  + thumb  ${path}  ${kb(buf.length)} -> ${kb(thumb.length)}`);
        if (APPLY) {
          const { error } = await db.storage.from(BUCKET).upload(folder ? `${folder}/${thumbName}` : thumbName, thumb, { upsert: true, contentType: 'image/webp', cacheControl: YEAR });
          if (error) throw new Error(`thumb upload: ${error.message}`);
        }
        made++;
      }

      const maxAge = Number(cache.match(/max-age=(\d+)/)?.[1] ?? 0);
      if (maxAge < 31536000) {
        console.log(`  ~ cache  ${path}  (${cache || 'none'} -> max-age=${YEAR})`);
        if (APPLY) {
          const { error } = await db.storage.from(BUCKET).upload(path, buf, { upsert: true, contentType, cacheControl: YEAR });
          if (error) throw new Error(`re-cache upload: ${error.message}`);
        }
        recached++;
      }
    } catch (e) {
      failed++;
      console.error(`  ! ${path}: ${e.message}`);
    }
  }
}

console.log(`\n${APPLY ? 'Done' : 'Would do'}: ${made} thumbnails (${kb(before)} of originals -> ${kb(after)} of thumbnails), ${recached} originals re-cached, ${failed} failed.`);
