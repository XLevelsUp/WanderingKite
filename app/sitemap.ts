import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://wanderingkite.in';
    const currentDate = new Date();

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
            'events/wedding', 'events/engagements', 'events/birthdays',
            'portraits/family', 'portraits/maternity', 'portraits/baby-shoots',
            'corporate/product', 'corporate/cinematic-videos', 'corporate/social-media', 'corporate/model-shoots', 'corporate/headshots',
            'commercial/ads', 'commercial/music-videos', 'commercial/short-films'
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
            url: `${baseUrl}/studio`,
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
    ];
}
