import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { MainNav } from '@/components/navigation/MainNav';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { brandConfig } from '@/config/brand.config';
import { siteConfig } from '@/config/site';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { NotificationProvider } from '@/components/ui/NotificationProvider';
import NextTopLoader from 'nextjs-toploader';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif',
  ],
});

export const metadata: Metadata = {
  // Fixes broken OG/Twitter image URLs — Next.js requires this for relative paths
  metadataBase: new URL('https://wanderingkite.in'),

  title: {
    default: 'Wandering Kite Studio | Photography & Studio Coimbatore',
    template: `%s | Wandering Kite Studio`,
  },
  description: brandConfig.description,
  keywords: [
    // Hyper-local primary
    'photography studio Coimbatore',
    'camera rental Coimbatore',
    'studio rental RS Puram Coimbatore',
    'podcast studio Coimbatore',
    'event photography Coimbatore',
    // Neighborhood & nearby cities
    'RS Puram studio',
    'photography studio near RS Puram',
    'camera rental Tirupur',
    'photography services Salem',
    'studio rental Erode',
    // Service + location
    'wedding photography Coimbatore',
    'commercial photography Tamil Nadu',
    'podcast recording studio Tamil Nadu',
    'video studio rental Coimbatore',
    'equipment rental near me Coimbatore',
    // Brand & equipment
    'Sony camera rental Coimbatore',
    'Canon lens rental Coimbatore',
    'Rode microphone rental',
    'cyclorama wall studio Coimbatore',
    // Intent-based
    'hire photographer Coimbatore',
    'book photography studio Coimbatore',
    'rent camera gear Coimbatore',
  ],
  authors: [{ name: 'Wandering Kite Studio' }],
  // Geo meta tags — strengthens local pack eligibility for RS Puram / Coimbatore
  other: {
    'geo.region': 'IN-TN',
    'geo.placename': 'Coimbatore',
    'geo.position': '11.0168;76.9558',
    ICBM: '11.0168, 76.9558',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: brandConfig.url,
    siteName: 'Wandering Kite Studio',
    title: 'Wandering Kite Studio — Photography & Creative Spaces Coimbatore',
    description: brandConfig.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Wandering Kite Studio — Creative Infrastructure in Coimbatore',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wandering Kite Studio | Photography & Studio Coimbatore',
    description: brandConfig.description,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: brandConfig.assets.favicon, sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // GA4: use env var with hardcoded fallback so Vercel always tracks
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-50PN3VN8P4';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService', 'Store'],
    '@id': 'https://wanderingkite.in/#business',
    name: 'Wandering Kite Studio',
    alternateName: 'Wandering Kite',
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    image: 'https://wanderingkite.in/og-image.jpg',
    logo: 'https://wanderingkite.in/logo.svg',
    // Correct Indian Rupee symbol for Indian market SERP display
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.contact.address.street,
      addressLocality: 'RS Puram',
      addressRegion: siteConfig.contact.address.state,
      postalCode: siteConfig.contact.address.zip,
      addressCountry: siteConfig.contact.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    // Covers searches from neighboring cities
    areaServed: [
      { '@type': 'City', name: 'Coimbatore' },
      { '@type': 'City', name: 'Tirupur' },
      { '@type': 'City', name: 'Salem' },
      { '@type': 'City', name: 'Erode' },
    ],
    sameAs: [
      siteConfig.links.instagram,
      siteConfig.links.youtube,
      siteConfig.links.linkedin,
    ],
    // AggregateRating — enables gold star rich snippet in Google SERPs
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '100',
      reviewCount: '100',
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
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Creative Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            '@id': 'https://wanderingkite.in/photography#service',
            name: 'Event & Lifestyle Photography',
            url: 'https://wanderingkite.in/photography',
            description:
              'Professional photography for weddings, events, portraits, product, and commercial projects in Coimbatore and across India.',
            areaServed: 'Coimbatore',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            '@id': 'https://wanderingkite.in/rentals#service',
            name: 'Camera & Equipment Rentals',
            url: 'https://wanderingkite.in/rentals',
            description:
              'Daily and weekly rental of Sony, Canon cameras, lenses, lighting rigs, and Rode audio equipment in Coimbatore.',
            areaServed: 'Coimbatore',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            '@id': 'https://wanderingkite.in/studiospace#service',
            name: 'Photography Studio Rental',
            url: 'https://wanderingkite.in/studiospace',
            description:
              '1200 sq ft photography and video studio with cyclorama wall, ProFoto lighting, and backdrops. Hourly and full-day rates.',
            areaServed: 'Coimbatore',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            '@id': 'https://wanderingkite.in/podcast#service',
            name: 'Podcast Recording Studio',
            url: 'https://wanderingkite.in/podcast',
            description:
              'Acoustic-treated podcast recording studio with Rode Procaster, Shure SM7B, multi-track recording, and 4K video option.',
            areaServed: 'Coimbatore',
          },
        },
      ],
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <ThemeProvider />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://scontent.cdninstagram.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextTopLoader
          color="#f59e0b"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #f59e0b,0 0 5px #f59e0b"
        />
        {/* Google Analytics 4 – loads whenever GA_ID is available */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  send_page_view: true,
                  enhanced_measurement: {
                    scrolls: true,
                    outbound_clicks: true,
                    file_downloads: true,
                    video_engagement: true
                  }
                });
              `}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Suspense>
          <NotificationProvider>
            <MainNav />
            {children}
            <BookingFlyout />
            <Toaster richColors position="bottom-right" />
          </NotificationProvider>
        </Suspense>
      </body>
    </html>
  );
}
