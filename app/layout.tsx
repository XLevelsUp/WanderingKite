import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MainNav } from '@/components/navigation/MainNav';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { brandConfig } from '@/config/brand.config';
import { siteConfig } from '@/config/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: brandConfig.name,
    template: `%s | ${brandConfig.name}`,
  },
  description: brandConfig.description,
  keywords: [
    // Local SEO - Service + City
    'podcast studio Coimbatore',
    'camera rentals Coimbatore',
    'photography studio Coimbatore',
    'studio rental Coimbatore',
    'event photography Coimbatore',
    // Service + Location Variations
    'camera rental near me',
    'event photography India',
    'podcast recording studio India',
    'photography services Tamil Nadu',
    // Equipment-Specific
    'Sony camera rental',
    'Canon lens rental',
    'Rode microphone rental',
    'DSLR rent Coimbatore',
    // Service-Specific
    'wedding photography Coimbatore',
    'commercial photography India',
    'podcast production Coimbatore',
    'video studio rental',
  ],
  authors: [{ name: brandConfig.name }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: brandConfig.url,
    siteName: brandConfig.name,
    title: brandConfig.name,
    description: brandConfig.description,
    images: [
      {
        url: brandConfig.assets.ogImage,
        width: 1200,
        height: 630,
        alt: `${brandConfig.name} - Creative Infrastructure for Modern Creators`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: brandConfig.name,
    description: brandConfig.description,
    images: [brandConfig.assets.ogImage],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: brandConfig.assets.favicon, sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService', 'Store'],
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
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
    priceRange: '$$',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Creative Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Event & Lifestyle Photography',
            description:
              'Professional photography for events, weddings, portraits, and commercial projects',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Camera & Equipment Rentals',
            description:
              'Professional camera, lens, lighting, and audio equipment rentals',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Studio Space Rental',
            description:
              '1200 sq ft photography and video studio with professional lighting and equipment',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Podcast Recording Studio',
            description:
              'Professional podcast recording with acoustic treatment and premium microphones',
          },
        },
      ],
    },
  };

  return (
    <html lang='en' className='dark'>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <MainNav />
        {children}
        <BookingFlyout />
      </body>
    </html>
  );
}
