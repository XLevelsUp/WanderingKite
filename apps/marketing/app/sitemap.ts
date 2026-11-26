import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';
import { albumHref, categoryHref, cityHref, getAlbums, getCatalog } from '@/lib/photography/data';

/**
 * Photography URLs from the live catalog (replaces the hard-coded pre-revamp list): sections, categories,
 * published albums, and city pages — but only cities that have at least one published album, since an
 * empty location page is thin content (those are also noindexed on the page itself).
 */
async function getPhotographyEntries(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const [cat, { albums }] = await Promise.all([getCatalog(), getAlbums({ pageSize: 1000 })]);
    const now = new Date();
    const entry = (path: string, priority: number) => ({ url: `${baseUrl}${path}`, lastModified: now, changeFrequency: 'monthly' as const, priority });
    const citiesWithWork = new Set(albums.map((a) => a.city_slug).filter(Boolean));
    return [
      ...cat.sections.map((sec) => entry(`/photography/${sec.slug}`, 0.9)),
      ...cat.categories.map((c) => entry(categoryHref(c), 0.8)),
      ...albums.map((a) => entry(albumHref(a), 0.7)),
      ...cat.cities.filter((c) => citiesWithWork.has(c.slug)).map((c) => entry(cityHref(c), 0.7)),
    ];
  } catch {
    return [];
  }
}

/**
 * Blog posts are admin-authored and go live on save, so the sitemap is
 * generated per request rather than baked at build time — a new post appears
 * without a redeploy.
 */
async function getBlogEntries(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, section, published_at, updated_at')
      .order('published_at', { ascending: false });

    if (error || !data) return [];

    return data.map((post) => ({
      // Each blog lives under its own section's route.
      url: `${baseUrl}${post.section === 'STUDIO' ? '/studiospace/blog' : '/blog'}/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // A sitemap that renders without posts beats one that 500s.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  const [blogEntries, photographyEntries] = await Promise.all([getBlogEntries(baseUrl), getPhotographyEntries(baseUrl)]);

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/photography`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    ...photographyEntries,
    ...(siteConfig.features.rentals
      ? [{ url: `${baseUrl}/rentals`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 1.0 }]
      : []),
    {
      url: `${baseUrl}/studiospace`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about/founder`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/studiospace/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogEntries,
  ];
}
