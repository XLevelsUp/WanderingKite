import { MetadataRoute } from 'next';

// ============================================================
// wanderingkite.in — Crawler Governance Policy
// Version: 3.0 | Updated: 2026-06-11
// Strategy: Permissive Access
//   Allows all search, AI, and auditing crawlers to access public pages,
//   while blocking internal administrative/system routes.
// ============================================================

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/_next/',
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://wanderingkite.in/sitemap.xml',
  };
}
