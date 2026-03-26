import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://wanderingkite.in';
    // Static date for major pages — prevents false freshness signals on every build.
    // Update this manually when page content changes substantially.
    const lastMajorUpdate = new Date('2025-12-01');
    const currentDate = new Date();

    return [
        {
            url: baseUrl,
            lastModified: lastMajorUpdate,
            changeFrequency: 'monthly',
            priority: 1.0, // Home is the canonical highest-priority page
        },
        {
            url: `${baseUrl}/photography`,
            lastModified: lastMajorUpdate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/rentals`,
            lastModified: currentDate, // Equipment inventory is dynamic
            changeFrequency: 'weekly', // Signals Googlebot to recrawl more often
            priority: 0.9,
        },
        {
            url: `${baseUrl}/studio`,
            lastModified: lastMajorUpdate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/podcast`,
            lastModified: lastMajorUpdate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: lastMajorUpdate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: lastMajorUpdate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/refunds`,
            lastModified: lastMajorUpdate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
}
