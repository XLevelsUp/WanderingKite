// Public photography data (catalog + published albums) for /photography pages. Server-only reads via the cookie-free client.
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { publicClient } from '@/lib/supabase/public';
import { getThumbIndex, toThumb } from '@/lib/images';
import type { Database } from '@/lib/database.types';

type T = Database['public']['Tables'];
export type Section = T['photo_sections']['Row'];
export type Group = T['photo_groups']['Row'];
export type Category = T['photo_categories']['Row'];
export type City = T['photo_cities']['Row'];
export type AlbumImage = Pick<T['gallery_images']['Row'], 'id' | 'url' | 'alt_text' | 'sort_order'>;
export type Album = Pick<
  T['shoots']['Row'],
  'id' | 'title' | 'slug' | 'client_names' | 'story' | 'shoot_date' | 'cover_image_url' | 'featured' | 'city_slug' | 'category_id'
> & { category: Category | null; city: City | null };
export type AlbumWithImages = Album & { images: AlbumImage[] };

export type Catalog = {
  sections: Section[];
  groups: Group[];
  categories: Category[];
  cities: City[];
};

/** Pages revalidate this often (seconds), so albums published in Admin appear within a few minutes. */
export const PHOTO_REVALIDATE = 300;

export const PAGE_SIZE = 9;

// Every DB read below is cached across requests for PHOTO_REVALIDATE seconds (tag 'photography'), so filtered/paginated
// pages — which render per request because of ?city/?page — still rarely touch the database.
const cached = <A extends unknown[], R>(fn: (...a: A) => Promise<R>, key: string) =>
  unstable_cache(fn, ['photography', key], { revalidate: PHOTO_REVALIDATE, tags: ['photography'] });

/** Whole catalog in one round-trip set; memoised per request and cached across requests. */
export const getCatalog = cache(cached(async (): Promise<Catalog> => {
  const db = publicClient();
  const [s, g, c, ci] = await Promise.all([
    db.from('photo_sections').select('*').order('sort_order'),
    db.from('photo_groups').select('*').order('sort_order'),
    db.from('photo_categories').select('*').order('sort_order'),
    db.from('photo_cities').select('*').order('sort_order'),
  ]);
  return { sections: s.data ?? [], groups: g.data ?? [], categories: c.data ?? [], cities: ci.data ?? [] };
}, 'catalog'));

export const findSection = (cat: Catalog, slug: string) => cat.sections.find((s) => s.slug === slug) ?? null;
export const findCategory = (cat: Catalog, section: string, slug: string) =>
  cat.categories.find((c) => c.section_slug === section && c.slug === slug) ?? null;
export const findCity = (cat: Catalog, slug: string | null | undefined) => (slug ? cat.cities.find((c) => c.slug === slug) ?? null : null);

/** Groups of a section, each with its categories in menu order. */
export function sectionTree(cat: Catalog, section: string) {
  return cat.groups
    .filter((g) => g.section_slug === section)
    .map((g) => ({ ...g, categories: cat.categories.filter((c) => c.section_slug === section && c.group_slug === g.slug) }));
}

export const albumHref = (a: Pick<Album, 'slug' | 'category'>) =>
  a.category && a.slug ? `/photography/${a.category.section_slug}/${a.category.slug}/${a.slug}` : '/photography';
export const categoryHref = (c: Pick<Category, 'section_slug' | 'slug'>) => `/photography/${c.section_slug}/${c.slug}`;
export const cityHref = (city: Pick<City, 'slug'>) => `/photography/wedding-photographer-in-${city.slug}`;

const ALBUM_COLS = 'id, title, slug, client_names, story, shoot_date, cover_image_url, featured, city_slug, category_id';

function attach(cat: Catalog, rows: Omit<Album, 'category' | 'city'>[]): Album[] {
  return rows.map((r) => ({
    ...r,
    category: cat.categories.find((c) => c.id === r.category_id) ?? null,
    city: findCity(cat, r.city_slug),
  }));
}

/** Published albums, newest first, filtered by section / category / city, paginated. */
export const getAlbums = cached(async function getAlbums(opts: { section?: string; categoryId?: string; city?: string | null; page?: number; pageSize?: number; featured?: boolean }) {
  const cat = await getCatalog();
  const pageSize = opts.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);

  let q = publicClient()
    .from('shoots')
    .select(ALBUM_COLS, { count: 'exact' })
    .eq('status', 'published')
    .not('category_id', 'is', null);

  if (opts.categoryId) q = q.eq('category_id', opts.categoryId);
  else if (opts.section) {
    const ids = cat.categories.filter((c) => c.section_slug === opts.section).map((c) => c.id);
    if (ids.length === 0) return { albums: [], total: 0, page, pageCount: 0 };
    q = q.in('category_id', ids);
  }
  if (opts.city) q = q.eq('city_slug', opts.city);
  if (opts.featured) q = q.eq('featured', true);

  const from = (page - 1) * pageSize;
  const { data, count } = await q
    .order('shoot_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  const total = count ?? 0;
  // List views show covers small (cards, tiles): use the 800px thumbnail when it exists. getAlbum keeps originals.
  const thumbs = await getThumbIndex();
  const rows = ((data ?? []) as Omit<Album, 'category' | 'city'>[]).map((r) => ({ ...r, cover_image_url: toThumb(r.cover_image_url, thumbs) }));
  return { albums: attach(cat, rows), total, page, pageCount: Math.ceil(total / pageSize) };
}, 'albums');

/** One published album with its images in admin order; null if missing, draft, or under a different category. */
export const getAlbum = cache(cached(async (section: string, categorySlug: string, slug: string): Promise<AlbumWithImages | null> => {
  const cat = await getCatalog();
  const category = findCategory(cat, section, categorySlug);
  if (!category) return null;

  const { data } = await publicClient()
    .from('shoots')
    .select(`${ALBUM_COLS}, gallery_images(id, url, alt_text, sort_order)`)
    .eq('status', 'published')
    .eq('slug', slug)
    .eq('category_id', category.id)
    .order('sort_order', { referencedTable: 'gallery_images' })
    .maybeSingle();
  if (!data) return null;

  // Hand-written DB types have no relationship metadata, so the joined row is typed loosely here.
  const { gallery_images, ...row } = data as unknown as Omit<Album, 'category' | 'city'> & { gallery_images: AlbumImage[] };
  const [album] = attach(cat, [row]);
  return { ...album, images: gallery_images ?? [] };
}, 'album'));

export type PortfolioPhoto = { id: string; url: string; alt: string; href: string; caption: string };

/**
 * Real photos for the hub's portfolio grid: interleaves images across the newest published albums
 * (one from each album in turn) so the grid shows range rather than one shoot. Alt text uses the
 * image's own alt from Admin, else a plain description built from category + city.
 */
export const getPortfolioPhotos = cached(async (limit: number): Promise<PortfolioPhoto[]> => {
  const cat = await getCatalog();
  const { data } = await publicClient()
    .from('shoots')
    .select(`${ALBUM_COLS}, gallery_images(id, url, alt_text, sort_order)`)
    .eq('status', 'published')
    .not('category_id', 'is', null)
    .order('shoot_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .order('sort_order', { referencedTable: 'gallery_images' })
    .limit(24);

  const rows = (data ?? []) as unknown as (Omit<Album, 'category' | 'city'> & { gallery_images: AlbumImage[] })[];
  const albums = rows.map((r) => ({ album: attach(cat, [r])[0], images: r.gallery_images ?? [] }));

  const thumbs = await getThumbIndex();
  const out: PortfolioPhoto[] = [];
  for (let round = 0; out.length < limit && albums.some((a) => a.images[round]); round++) {
    for (const { album, images } of albums) {
      const img = images[round];
      if (!img || out.length >= limit) continue;
      const kind = album.category?.name ?? 'Photography';
      const where = album.city?.name ?? 'Coimbatore';
      out.push({
        id: img.id,
        url: toThumb(img.url, thumbs),
        alt: img.alt_text?.trim() || `${kind} photography in ${where} by Wandering Kite`,
        href: albumHref(album),
        caption: `${kind} · ${where}`,
      });
    }
  }
  return out;
}, 'portfolio-photos');

/** Up to `limit` other albums from the same category (falls back to the section). */
export async function getRelatedAlbums(album: Album, limit = 3) {
  const same = await getAlbums({ categoryId: album.category_id ?? undefined, pageSize: limit + 1 });
  let list = same.albums.filter((a) => a.id !== album.id);
  if (list.length < limit && album.category) {
    const more = await getAlbums({ section: album.category.section_slug, pageSize: limit + 4 });
    list = [...list, ...more.albums.filter((a) => a.id !== album.id && !list.some((l) => l.id === a.id))];
  }
  return list.slice(0, limit);
}

/** Display title for a card: couple/client names, else the album title. */
export const albumTitle = (a: Pick<Album, 'client_names' | 'title'>) => a.client_names?.trim() || a.title;

export const formatShootDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : null;

/** Per-category album count + newest cover for a section's category tiles (one query, cached). */
export const getSectionOverview = cached(async (section: string) => {
  const cat = await getCatalog();
  const ids = cat.categories.filter((c) => c.section_slug === section).map((c) => c.id);
  const stats: Record<string, { count: number; cover: string | null }> = {};
  if (ids.length === 0) return stats;

  const thumbs = await getThumbIndex();
  const { data } = await publicClient()
    .from('shoots')
    .select('category_id, cover_image_url, shoot_date, created_at')
    .eq('status', 'published')
    .in('category_id', ids)
    .order('shoot_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  for (const r of (data ?? []) as { category_id: string | null; cover_image_url: string | null }[]) {
    if (!r.category_id) continue;
    const s = (stats[r.category_id] ??= { count: 0, cover: null });
    s.count += 1;
    s.cover ??= toThumb(r.cover_image_url, thumbs);
  }
  return stats;
}, 'section-overview');
