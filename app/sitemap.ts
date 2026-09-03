import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

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
  const baseUrl = 'https://wanderingkite.in';
  const currentDate = new Date();

  const blogEntries = await getBlogEntries(baseUrl);

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
    ...['events', 'portraits', 'corporate', 'commercial'].map((cat) => ({
      url: `${baseUrl}/photography/${cat}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...[
      'events/wedding',
      'events/engagements',
      'events/birthdays',
      'events/house-warming',
      'events/puberty-ceremonies',
      'portraits/family',
      'portraits/maternity',
      'portraits/baby-shoots',
      'corporate/product',
      'corporate/cinematic-videos',
      'corporate/social-media',
      'corporate/model-shoots',
      'corporate/headshots',
      'commercial/ads',
      'commercial/music-videos',
      'commercial/short-films',
    ].map((subCat) => ({
      url: `${baseUrl}/photography/${subCat}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${baseUrl}/rentals`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/studiospace`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/podcast`,
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
