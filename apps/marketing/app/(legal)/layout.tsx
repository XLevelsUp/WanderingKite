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
  // LocalBusiness Schema — canonical values MUST match root layout.tsx.
  // @id links this to the same entity declared globally; AI agents and
  // search engines will merge rather than conflict the two blocks.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.wanderingkite.in/#business', // same @id as root layout
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
    priceRange: '₹₹',
    // Canonical hours — must stay in sync with root layout.tsx
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '17:00',
      },
    ],
  };

  // Schema only: each legal page owns its palette (privacy/terms use the light LegalPage; the older pages style themselves).
  return (
    <>
      {/* Injecting LocalBusiness Schema for Google Map Pack ranking */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
