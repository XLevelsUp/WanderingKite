import { unstable_cache } from 'next/cache';
import { publicClient } from '@/lib/supabase/public';
import { cleanEquipmentName } from '@/lib/equipment-name';
import { getThumbIndex, toThumb } from '@/lib/images';

/**
 * Public data for /studiospace, read with the cookie-free anon client and cached for 5 minutes — so the page can be
 * statically generated and revalidated (ISR) instead of rendered on every request (it was `force-dynamic`, ~1.2s TTFB).
 * Anonymous visitors only ever had anon (RLS-public) access, so the rows are the same as before.
 * Admin price/equipment edits show up within ~5 minutes.
 */
const REVALIDATE = 300;

const activeRows = (table: 'studio_packages' | 'studio_add_ons' | 'podcast_packages') =>
  unstable_cache(
    async () => {
      const { data, error } = await (publicClient() as unknown as { from: (t: string) => any })
        .from(table)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      return error || !data ? [] : (data as any[]);
    },
    ['studio-data', table],
    { revalidate: REVALIDATE, tags: ['studio-pricing'] }
  );

export const getStudioPackagesCached = activeRows('studio_packages');
export const getStudioAddOnsCached = activeRows('studio_add_ons');
export const getPodcastPackagesCached = activeRows('podcast_packages');

/** Equipment available for the studio, with names cleaned and photos swapped for 800px thumbnails when they exist. */
export const getStudioEquipmentCached = unstable_cache(
  async () => {
    const { data, error } = await (publicClient() as unknown as { from: (t: string) => any })
      .from('equipment')
      .select('*, categories(name), branches(name)')
      .is('deletedAt', null)
      .order('createdAt', { ascending: false });
    if (error || !data) return [];
    const thumbs = await getThumbIndex();
    return (data as any[])
      .filter((eq) => eq.available_for_studio === true)
      .map((eq) => ({
        ...eq,
        name: typeof eq.name === 'string' ? cleanEquipmentName(eq.name) : eq.name,
        image_url: toThumb(eq.image_url as string | null, thumbs),
      }));
  },
  ['studio-data', 'equipment'],
  { revalidate: REVALIDATE, tags: ['equipment'] }
);
