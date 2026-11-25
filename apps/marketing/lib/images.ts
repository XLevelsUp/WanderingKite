import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { publicClient } from '@/lib/supabase/public';

/**
 * Thumbnails for Supabase Storage images (the free plan has no on-the-fly resizing).
 *
 * Convention: next to every original `folder/name-123.jpg` there may be a `folder/name-123.w800.webp`
 * (made by the admin uploader for new photos, and by scripts/generate-thumbnails.mjs for old ones).
 * Grids and cards use the thumbnail ONLY when it exists in storage — otherwise the original URL is kept,
 * so a missing thumbnail can never show as a broken image.
 */
export const THUMB_WIDTH = 800;
const BUCKET = 'equipment-images';
const FOLDERS = ['portfolio', 'blog', '']; // '' = bucket root (equipment photos)
const MARK = `/storage/v1/object/public/${BUCKET}/`;

export const thumbPathFor = (path: string) => `${path.replace(/\.[a-z0-9]+$/i, '')}.w${THUMB_WIDTH}.webp`;

/** Every object path in the image folders (cached 5 min, so new thumbnails show up without a deploy). */
const listThumbPaths = unstable_cache(
  async (): Promise<string[]> => {
    const db = publicClient();
    const out: string[] = [];
    for (const folder of FOLDERS) {
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await db.storage.from(BUCKET).list(folder, { limit: 1000, offset });
        if (error || !data?.length) break;
        for (const f of data) if (f.name.endsWith(`.w${THUMB_WIDTH}.webp`)) out.push(folder ? `${folder}/${f.name}` : f.name);
        if (data.length < 1000) break;
      }
    }
    return out;
  },
  ['storage-thumb-index'],
  { revalidate: 300, tags: ['thumbs'] }
);

/** Per-request Set of existing thumbnail paths. */
export const getThumbIndex = cache(async () => new Set(await listThumbPaths()));

/** The thumbnail URL for a Storage image if one exists, else the URL unchanged (also passes null through). */
export function toThumb<T extends string | null | undefined>(url: T, index: Set<string>): T {
  if (!url) return url;
  const i = url.indexOf(MARK);
  if (i < 0) return url;
  const thumb = thumbPathFor(url.slice(i + MARK.length));
  return (index.has(thumb) ? `${url.slice(0, i + MARK.length)}${thumb}` : url) as T;
}
