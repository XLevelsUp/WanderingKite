import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import {
  podcastTestimonials,
  podcastProcessSteps,
  podcastFAQs,
} from '@/lib/service-page-data';
import { JsonLd } from '@/lib/schema-helpers';
import { Mic, Headphones, Radio, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Podcast Recording Studio Coimbatore | Rode, Shure | Book Now',
  description:
    'Acoustic-treated podcast studio in Coimbatore with Rode Procaster, Shure SM7B & 4K video. From ₹1,200/hr. Solo to full production packages. Book on WhatsApp.',
  keywords: [
    // Core podcast intent
    'podcast studio Coimbatore',
    'podcast recording studio Coimbatore',
    'record podcast Coimbatore',
    'podcast studio near me Coimbatore',
    // Equipment-specific (high-intent)
    'Rode microphone studio Coimbatore',
    'Shure SM7B recording Coimbatore',
    'multi-track recording studio Coimbatore',
    'acoustic recording studio Coimbatore',
    // "how to" / question intent (Answer the Public)
    'how to record a podcast in Coimbatore',
    'podcast recording cost Coimbatore',
    'professional podcast studio Tamil Nadu',
    // Video podcast trend
    'video podcast studio Coimbatore',
    '4K podcast recording Coimbatore',
    'YouTube podcast studio Coimbatore',
    // Persona-based
    'podcast studio for startups Coimbatore',
    'interview recording studio Coimbatore',
    // Neighboring cities
    'podcast studio Tirupur',
    'audio recording studio Tamil Nadu',
    'podcast production India',
    'podcast recording India',
  ],
  openGraph: {
    title: 'Podcast Recording Studio Coimbatore | Rode, Shure, 4K Video',
    description:
      'Professional podcast studio in Coimbatore with acoustic treatment, Rode Procaster, Shure SM7B & 4K video option. From ₹1,200/hr.',
    url: 'https://wanderingkite.in/podcast',
    images: [{ url: '/og-podcast.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://wanderingkite.in/podcast',
  },
};

const podcastFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I need any technical knowledge to record a podcast in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not at all! Our audio engineer handles all technical setup at our Coimbatore studio. You just need to show up and focus on your content. We guide you through the entire recording process.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does podcast recording cost in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solo Creator sessions start at ₹1,200/hour. Interview Setup is ₹1,800/hour (2–3 people). Full Production (up to 4 guests with video) is ₹5,000 for 4 hours. All packages include Rode Procaster or Shure SM7B microphones.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I record a video podcast at your Coimbatore studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Video recording is available with Interview Setup and Full Production packages. We use a multi-camera setup (2–3 angles) with 4K recording, professional lighting, and green screen option.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I bring multiple guests to the podcast studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Solo Creator supports 1 host, Interview Setup supports 2–3 people, and Full Production supports up to 4 guests. Each person gets their own dedicated microphone and headphones.',
      },
    },
    {
      '@type': 'Question',
      name: 'What podcast editing is included in the recording package?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Basic editing includes noise reduction, level balancing, and removing long pauses. The Full Production package includes advanced editing: intro/outro music, sound effects, and mastering. Audio files are delivered as WAV and MP3.',
      },
    },
    {
      '@type': 'Question',
      name: 'What microphones are available at the Coimbatore podcast studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our studio is equipped with Rode Procaster and Shure SM7B microphones, a Scarlett 4i4 audio interface, and a Zoom H6 multi-track recorder. You can also bring your own XLR microphone.',
      },
    },
  ],
};

const podcastBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://wanderingkite.in',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Podcast Studio',
      item: 'https://wanderingkite.in/podcast',
    },
  ],
};

const podcastPricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://wanderingkite.in/podcast#service',
  name: 'Podcast Recording Studio Coimbatore',
  provider: { '@id': 'https://wanderingkite.in/#business' },
  areaServed: { '@type': 'City', name: 'Coimbatore' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Solo Creator Podcast Recording',
      price: '1200',
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '1200',
        priceCurrency: 'INR',
        unitText: 'HOUR',
      },
    },
    {
      '@type': 'Offer',
      name: 'Interview Setup Podcast Recording',
      price: '1800',
      priceCurrency: 'INR',
    },
    {
      '@type': 'Offer',
      name: 'Full Production Podcast Package',
      price: '5000',
      priceCurrency: 'INR',
    },
  ],
};

const equipment = [
  {
    icon: Mic,
    title: 'Premium Microphones',
    description: 'Rode Procaster & Shure SM7B',
  },
  {
    icon: Headphones,
    title: 'Studio Monitors',
    description: 'Closed-back headphones for all guests',
  },
  {
    icon: Radio,
    title: 'Multi-Track Recording',
    description: 'Zoom H6 & audio interface',
  },
  {
    icon: Zap,
    title: 'Acoustic Treatment',
    description: 'Professional soundproofing & panels',
  },
];

const packages = [
  {
    name: 'Solo Creator',
    price: '1,200',
    duration: '/hour',
    features: [
      '1 host setup',
      'Single mic & headphones',
      'Basic editing included',
      'WAV file delivery',
    ],
  },
  {
    name: 'Interview Setup',
    price: '1,800',
    duration: '/hour',
    features: [
      '2-3 person setup',
      'Multiple mics',
      'Video recording option',
      'Multi-track files',
    ],
    popular: true,
  },
  {
    name: 'Full Production',
    price: '5,000',
    duration: '/4 hours',
    features: [
      'Up to 4 guests',
      'Video + audio',
      'Professional editing',
      'Same-day delivery',
    ],
  },
];

export default function PodcastPage() {
  return (
    <>
      <JsonLd
        data={[podcastFaqSchema, podcastBreadcrumbSchema, podcastPricingSchema]}
      />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-500">
                <Mic className="h-4 w-4" />
                Podcast Studio
              </div>
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                Podcast Recording
                <br />
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  Studio
                </span>
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Broadcast-quality podcast recording with professional acoustics,
                premium microphones, and expert support.
              </p>
              <a
                href={generateWhatsAppLink('podcast')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-green-500 px-8 py-4 font-semibold text-foreground transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/50"
              >
                Book Recording Session
              </a>
            </div>
          </div>
        </section>

        {/* Equipment & Features */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-4xl font-bold">
              Studio Equipment
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {equipment.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-muted/50 p-6 text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                      <item.icon className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-4xl font-bold">
              Recording Packages
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`relative rounded-2xl border p-8 ${
                    pkg.popular
                      ? 'border-green-500 bg-green-500/5'
                      : 'border-border bg-muted/50'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-4 py-1 text-xs font-semibold text-foreground">
                      Most Popular
                    </span>
                  )}
                  <h3 className="mb-2 text-2xl font-bold">{pkg.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-green-500">
                      ₹{pkg.price}
                    </span>
                    <span className="text-muted-foreground">
                      {pkg.duration}
                    </span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={generateWhatsAppLink(
                      'podcast',
                      `Hi! I'd like to book the ${pkg.name} podcast package.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
                      pkg.popular
                        ? 'bg-green-500 text-zinc-950 hover:bg-green-400'
                        : 'bg-white text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    Book Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-center text-4xl font-bold">
                Technical Specifications
              </h2>
              <div className="rounded-2xl border border-border bg-muted/50 p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-bold text-green-500">
                      Audio Setup
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Rode Procaster microphones</li>
                      <li>• Shure SM7B (premium option)</li>
                      <li>• Scarlett 4i4 audio interface</li>
                      <li>• Zoom H6 multi-track recorder</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 font-bold text-green-500">
                      Room Acoustics
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Professional acoustic panels</li>
                      <li>• Bass traps in corners</li>
                      <li>• Isolated recording booth</li>
                      <li>• Noise floor: -60dB</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 font-bold text-green-500">
                      Video Option
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Multi-camera setup (2-3 angles)</li>
                      <li>• 4K video recording</li>
                      <li>• Professional lighting</li>
                      <li>• Green screen available</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 font-bold text-green-500">Amenities</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• High-speed WiFi</li>
                      <li>• Air conditioning</li>
                      <li>• Green room/lounge</li>
                      <li>• Free parking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials testimonials={podcastTestimonials} accentColor="green" />

        {/* Process Timeline */}
        <ProcessTimeline steps={podcastProcessSteps} accentColor="green" />

        {/* FAQ */}
        <ServiceFAQ faqs={podcastFAQs} accentColor="green" />

        <BookingFlyout service="podcast" />
        <Footer account="studio" />
      </main>
    </>
  );
}
