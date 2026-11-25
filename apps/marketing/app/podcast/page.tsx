import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { StudioReviews } from '@/components/studio/StudioReviews';
import { StudioProcess } from '@/components/studio/StudioProcess';
import { StudioFAQ } from '@/components/studio/StudioFAQ';
import { STUDIO_WRAP } from '@/components/studio/wrap';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import {
  podcastTestimonials,
  podcastProcessSteps,
  podcastFAQs,
} from '@/lib/service-page-data';
import { JsonLd } from '@/lib/schema-helpers';
import { Mic, Headphones, Radio, Zap, ArrowRight, Check } from 'lucide-react';

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
    url: 'https://www.wanderingkite.in/podcast',
    images: [{ url: '/og-podcast.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://www.wanderingkite.in/podcast',
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
      item: 'https://www.wanderingkite.in',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Podcast Studio',
      item: 'https://www.wanderingkite.in/podcast',
    },
  ],
};

const podcastPricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://www.wanderingkite.in/podcast#service',
  name: 'Podcast Recording Studio Coimbatore',
  provider: { '@id': 'https://www.wanderingkite.in/#business' },
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

const specs = [
  { title: 'Audio Setup', items: ['Rode Procaster microphones', 'Shure SM7B (premium option)', 'Scarlett 4i4 audio interface', 'Zoom H6 multi-track recorder'] },
  { title: 'Room Acoustics', items: ['Professional acoustic panels', 'Bass traps in corners', 'Isolated recording booth', 'Noise floor: -60dB'] },
  { title: 'Video Option', items: ['Multi-camera setup (2-3 angles)', '4K video recording', 'Professional lighting', 'Green screen available'] },
  { title: 'Amenities', items: ['High-speed WiFi', 'Air conditioning', 'Green room/lounge', 'Free parking'] },
];

// Decorative waveform heights (%) for the hero console; static, no animation cost.
const WAVE = [25, 45, 70, 40, 90, 55, 30, 65, 100, 50, 75, 35, 85, 60, 30, 70, 95, 45, 65, 40, 80, 50, 35, 60, 75, 45, 30, 55];

const CTA = 'inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-deep to-primary px-6 text-sm font-semibold text-primary-foreground transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export default function PodcastPage() {
  return (
    <>
      <JsonLd
        data={[podcastFaqSchema, podcastBreadcrumbSchema, podcastPricingSchema]}
      />
      <main className="min-h-screen bg-background">
        {/* Hero — copy left, "console" card right on lg; top padding = 80px header + 32/48/64px. */}
        <section className="border-b border-border">
          <div className={`${STUDIO_WRAP} grid gap-12 pb-16 pt-28 sm:pb-20 sm:pt-32 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-24 lg:pt-36`}>
            <div className="lg:col-span-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-deep/50 bg-primary-deep/15 px-3 py-1.5 text-xs font-semibold text-accent-text">
                <Mic className="h-3.5 w-3.5" aria-hidden />
                Podcast Studio
              </p>
              <h1 className="mt-6 text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
                Podcast Recording{' '}
                <span className="text-accent-text">Studio</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Broadcast-quality podcast recording with professional acoustics,
                premium microphones, and expert support.
              </p>
              <a href={generateWhatsAppLink('podcast')} target="_blank" rel="noopener noreferrer" className={`${CTA} mt-8`}>
                Book Recording Session
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Console card: mic + live waveform look + package ladder, built from the packages below. */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl border border-primary-deep/40 bg-gradient-to-br from-primary-deep/20 via-card to-card p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-deep to-primary text-primary-foreground">
                    <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-primary/30 motion-reduce:hidden" />
                    <Mic className="relative h-5 w-5" aria-hidden />
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
                    <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
                    Multi-Track Recording
                  </div>
                </div>

                <div aria-hidden className="mt-6 flex h-20 items-center gap-1">
                  {WAVE.map((h, i) => (
                    <span key={i} className="flex-1 rounded-full bg-gradient-to-t from-primary-deep to-primary" style={{ height: `${h}%`, opacity: 0.35 + (h / 100) * 0.65 }} />
                  ))}
                </div>

                <ul className="mt-6 divide-y divide-border border-t border-border">
                  {packages.map((pkg) => (
                    <li key={pkg.name} className="flex items-center justify-between gap-4 py-4">
                      <span className="text-sm font-medium text-foreground">{pkg.name}</span>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        <span className="font-semibold text-foreground">₹{pkg.price}</span>
                        {pkg.duration}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Studio Equipment */}
        <section aria-labelledby="podcast-gear-heading">
          <div className={`${STUDIO_WRAP} py-16 sm:py-20`}>
            <h2 id="podcast-gear-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Studio Equipment
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-6">
              {equipment.map((item) => (
                <div key={item.title} className="group rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/40">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-deep/20 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recording Packages */}
        <section aria-labelledby="podcast-packages-heading" className="border-t border-border">
          <div className={`${STUDIO_WRAP} py-16 sm:py-20`}>
            <h2 id="podcast-packages-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Recording Packages
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3 lg:mt-12 lg:gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`relative flex flex-col rounded-2xl border p-6 lg:p-8 ${
                    pkg.popular
                      ? 'border-primary/60 bg-gradient-to-b from-primary-deep/20 to-card'
                      : 'border-border bg-card'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-primary-deep to-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
                  <p className="mt-4">
                    <span className="text-3xl font-bold tabular-nums text-primary">₹{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">{pkg.duration}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-2">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={generateWhatsAppLink('podcast', `Hi! I'd like to book the ${pkg.name} podcast package.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      pkg.popular
                        ? `${CTA} mt-8 w-full`
                        : 'mt-8 inline-flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    }
                  >
                    Book Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Specifications — four columns in one panel on lg. */}
        <section aria-labelledby="podcast-specs-heading" className="border-t border-border">
          <div className={`${STUDIO_WRAP} py-16 sm:py-20`}>
            <h2 id="podcast-specs-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Technical Specifications
            </h2>
            <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
              {specs.map((s) => (
                <div key={s.title} className="bg-card p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">{s.title}</h3>
                  <ul className="mt-4 space-y-2">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <StudioReviews reviews={podcastTestimonials} />
        <StudioProcess steps={podcastProcessSteps} />
        <StudioFAQ faqs={podcastFAQs} service="podcast" />

        <BookingFlyout service="podcast" />
        <Footer account="studio" />
      </main>
    </>
  );
}
