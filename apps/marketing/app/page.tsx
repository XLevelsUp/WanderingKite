// SERVER COMPONENT — exports metadata + FAQPage JSON-LD for the home page
// The client-side animations live in home-client.tsx
import type { Metadata } from 'next';
import { HomePageClient } from './home-client';
import { Footer } from '@/components/shared/Footer';
import { JsonLd, buildReviewSchema } from '@/lib/schema-helpers';
import { homepageTestimonials } from '@/lib/service-page-data';

export const metadata: Metadata = {
  title: 'Wandering Kite | Best Photographers in Coimbatore | Wedding & Commercial',
  description:
    "Book Coimbatore's top wedding, event & commercial photographers. BIS-quality work, RS Puram studio, 1200 sq ft rental space. View portfolio & book today.",
  keywords: [
    'photography studio Coimbatore',
    'creative studio Coimbatore',
    'camera rental Coimbatore',
    'studio rental near me Coimbatore',
    'podcast studio Coimbatore',
    'best photographer in Coimbatore',
    'where to rent camera in Coimbatore',
    'photography services near RS Puram',
    'creative agency Coimbatore',
    'studio space Tirupur',
    'photographer near Erode',
    'photography studio Salem Tamil Nadu',
    'Wandering Kite Studio Coimbatore',
    'Wandering Kite photography',
    'top rated photography studio Coimbatore',
    'photography and studio rental Coimbatore',
    'video studio with equipment rental',
    'one stop creative studio Coimbatore',
  ],
  openGraph: {
    title: 'Wandering Kite Studio — Photography & Creative Spaces Coimbatore',
    description:
      'Photography, camera rentals, 1200 sq ft studio & podcast recording in RS Puram, Coimbatore. 5★ Google rated. Book via WhatsApp.',
    url: 'https://www.wanderingkite.in',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Wandering Kite Studio, RS Puram, Coimbatore',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.wanderingkite.in',
  },
};

// Extends the root LocalBusiness entity from layout.tsx with the homepage's visible reviews (avoids duplicate/conflicting name, hours & address).
const homeReviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.wanderingkite.in/#business',
  ...buildReviewSchema(homepageTestimonials),
};

// FAQPage schema — matches the 6 questions in components/sections/FAQ.tsx
const homeFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you provide technicians or operators with the equipment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer optional technical support for an additional fee. Our experienced technicians can assist with setup, operation, and troubleshooting. For studio and podcast bookings, basic technical guidance is included.',
      },
    },
    {
      '@type': 'Question',
      name: "What's the security deposit for equipment rentals in Coimbatore?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Security deposits vary by equipment value: ₹5,000–₹10,000 for cameras and lenses, ₹2,000–₹5,000 for lighting and audio equipment. Deposits are fully refundable upon safe return. We accept cash, UPI, or bank transfer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is parking available at your Coimbatore studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We offer free parking for up to 3 vehicles at our RS Puram, Coimbatore studio. Additional street parking is available nearby for larger crews.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you have power backup for studio sessions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Our studio has a 10KVA generator backup that kicks in within 3 seconds of power failure. We also have UPS backup for all sensitive equipment to ensure zero downtime during your shoot.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I extend my rental period if needed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, extensions are subject to availability. Contact us via WhatsApp at least 2 hours before your rental ends. Extension rates are prorated based on our standard hourly/daily rates.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if equipment gets damaged during my rental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Minor wear and tear is expected and covered. For accidental damage, repair costs are deducted from your security deposit. We recommend purchasing our optional damage waiver (10% of rental cost) for complete peace of mind.',
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[homeReviewSchema, homeFaqSchema]} />
      <HomePageClient />
      {/* Rendered here (server) rather than inside HomePageClient, so the footer ships no client JS. */}
      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}
