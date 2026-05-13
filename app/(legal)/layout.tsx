// app/(legal)/layout.tsx
import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: {
    template: '%s | Wandering Kite Coimbatore',
    default: 'Legal & Trust | Wandering Kite',
  },
  description:
    'Professional service agreements and privacy policies for Wandering Kite Photography and Studio Space in Coimbatore.',
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // LocalBusiness Schema for SEO Authority
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    image: `${siteConfig.url}/wkfulllogo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.contact.address.street,
      addressLocality: siteConfig.contact.address.city,
      addressRegion: siteConfig.contact.address.state,
      postalCode: siteConfig.contact.address.zip,
      addressCountry: siteConfig.contact.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:00',
        closes: '21:00',
      },
    ],
  };

  return (
    <section className="min-h-screen bg-zinc-950 pt-24 pb-16">
      {/* Injecting LocalBusiness Schema for Google Map Pack ranking */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb for UX and SEO Navigation */}
        <nav className="text-zinc-500 text-sm mb-8 flex gap-2">
          <a href="/" className="hover:text-amber-500 transition-colors">
            Home
          </a>
          <span>/</span>
          <span className="text-zinc-400">Legal</span>
        </nav>

        <div
          className="prose prose-invert prose-amber max-w-none 
          prose-headings:text-amber-500 prose-headings:font-bold 
          prose-p:text-zinc-400 prose-p:leading-relaxed 
          prose-strong:text-white prose-li:text-zinc-400"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
