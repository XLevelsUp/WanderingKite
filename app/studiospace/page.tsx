import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import {
  studioTestimonials,
  studioProcessSteps,
  studioFAQs,
} from '@/lib/service-page-data';
import { getEquipment } from '@/actions/equipment';

import {
  Building2,
  Maximize,
  Lightbulb,
  Wifi,
  Shirt,
  Zap,
  Box,
  PanelsTopLeft,
  Mic,
  Headphones,
  Radio,
} from 'lucide-react';
import { StudioCarousel } from '@/components/sections/StudioCarousel';
import { StudioPricingEngine } from '@/components/studio/StudioPricingEngine';
import { BackdropsGallery } from '@/components/studio/BackdropsGallery';
import ServiceTerms from '@/components/sections/ServiceTerms';

import { JsonLd } from '@/lib/schema-helpers';

const podcastEquipment = [
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

const podcastPackages = [
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

export const metadata: Metadata = {
  title: 'Photography Studio Rental Coimbatore | 1200 sq ft | Book by Hour',
  description:
    "Rent Coimbatore's 1200 sq ft photography & video studio in RS Puram. Cyclorama wall, ProFoto strobes, backdrops. From ₹1,500/hr. Book on WhatsApp today.",
  keywords: [
    // Core local terms
    'photography studio rental Coimbatore',
    'studio space for rent Coimbatore',
    'photo studio RS Puram Coimbatore',
    'video studio rental Coimbatore',
    // Size/spec-based queries
    '1200 sq ft studio Coimbatore',
    'studio with cyclorama wall Coimbatore',
    'studio with white backdrop Coimbatore',
    // Pricing intent (high-conversion)
    'studio rental per hour Coimbatore',
    'hourly studio rental Coimbatore',
    'half day studio rental Coimbatore',
    'affordable studio rental Coimbatore',
    // Use case
    'fashion photography studio Coimbatore',
    'product shoot studio Coimbatore',
    'corporate video studio Coimbatore',
    'YouTube video studio Coimbatore',
    // Neighboring cities
    'studio rental near Tirupur',
    'photo studio Salem Tamil Nadu',
    'studio for rent Tamil Nadu',
    // Equipment included
    'studio with Profoto lighting Coimbatore',
    'studio rental with equipment included',
  ],
  openGraph: {
    title: 'Photography Studio Rental Coimbatore | 1200 sq ft | RS Puram',
    description:
      '1200 sq ft photography & video studio in Coimbatore with cyclorama, ProFoto lights & backdrops. Book from ₹1,500/hr.',
    url: 'https://wanderingkite.in/studiospace',
    images: [{ url: '/og-studio.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://wanderingkite.in/studiospace',
  },
};

const studioFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What equipment is included in the photography studio rental in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All packages include continuous LED lights (3×), strobe lights (2×), light stands, modifiers, reflectors, diffusers, and multiple backdrops (white, black, and colored seamless paper). Additional cameras and lenses can be rented separately.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does it cost to rent the photography studio in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hourly rate starts at ₹1,500 (minimum 1 hour). Half-day (4 hours) is ₹6,000, and a full day (8 hours) is ₹10,000. All packages include lighting equipment and WiFi.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is parking available at the Coimbatore studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, free parking is available for up to 3 vehicles. The studio is located in RS Puram, Coimbatore with additional street parking nearby for larger crews.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel or reschedule my studio booking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cancellations 72+ hours in advance receive a 100% refund. 48–72 hours: 75% refund. 24–48 hours: 50% refund. Less than 24 hours: no refund. One free reschedule is allowed if done 48+ hours in advance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I bring my own camera equipment to the studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! You are welcome to bring your own cameras, lenses, and lighting. The studio provides the space and standard included equipment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the studio have a green screen and cyclorama wall?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, the 1200 sq ft studio features a cyclorama wall, green screen, and multiple seamless paper backdrops. The 14ft ceilings allow for a wide range of lighting setups.',
      },
    },
  ],
};

const studioBreadcrumbSchema = {
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
      name: 'Studio Space Rental',
      item: 'https://wanderingkite.in/studiospace',
    },
  ],
};

const studioPricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://wanderingkite.in/studiospace#service',
  name: 'Photography Studio Rental Coimbatore',
  provider: { '@id': 'https://wanderingkite.in/#business' },
  areaServed: { '@type': 'City', name: 'Coimbatore' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Hourly Studio Rental',
      price: '1500',
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '1500',
        priceCurrency: 'INR',
        unitText: 'HOUR',
      },
    },
    {
      '@type': 'Offer',
      name: 'Half Day Studio Rental',
      price: '6000',
      priceCurrency: 'INR',
    },
    {
      '@type': 'Offer',
      name: 'Full Day Studio Rental',
      price: '10000',
      priceCurrency: 'INR',
    },
  ],
};

const facilities = [
  {
    icon: Maximize,
    title: 'AC Studio Space',
    description: 'Spacious studio with 14ft ceilings',
  },
  {
    icon: Lightbulb,
    title: 'Professional Lighting',
    description: 'Continuous & strobe lighting setups',
  },
  {
    icon: Building2,
    title: 'Multiple Backdrops',
    description: 'White, black, and colored seamless paper',
  },
  {
    icon: Wifi,
    title: 'High-Speed WiFi',
    description: 'Fast internet for tethered shooting',
  },
  {
    icon: Shirt,
    title: 'Changing Room',
    description: 'Dedicated makeup and changing area',
  },
  {
    icon: Zap,
    title: 'Power Backup',
    description: 'Uninterrupted power supply for shoots',
  },
  {
    icon: Box,
    title: 'Infinity Wall',
    description: 'Professional cyclorama wall setup',
  },
  {
    icon: PanelsTopLeft,
    title: 'Movable Walls',
    description: 'Flexible custom backdrop solutions',
  },
];

const pricingTiers = [
  {
    name: 'Hourly',
    price: '1,500',
    duration: '/hour',
    features: [
      'Minimum 1 hour',
      'Basic lighting included',
      'WiFi access',
      'Changing room',
    ],
  },
  {
    name: 'Half Day',
    price: '6,000',
    duration: '/4 hours',
    features: [
      '4 hours studio time',
      'All lighting equipment',
      'Multiple backdrops',
      'Makeup area',
    ],
    popular: true,
  },
  {
    name: 'Full Day',
    price: '10,000',
    duration: '/8 hours',
    features: [
      '8 hours studio time',
      'All equipment included',
      'Flexible scheduling',
    ],
  },
];

export default async function StudioPage() {
  // Fetch live equipment summary
  const equipment = await getEquipment();

  // Group up to 3 names per category for the preview text
  const getTopItems = (catMatch: string) => {
    const matches = equipment.filter((e) => {
      const catName = (e.categories as any)?.name?.toLowerCase() || '';
      return catName.includes(catMatch);
    });
    return (
      matches
        .slice(0, 3)
        .map((e) => e.name)
        .join(', ') || `Various ${catMatch}s available`
    );
  };

  const previewCameras = getTopItems('camera');
  const previewLenses = getTopItems('lens');
  const previewLighting = getTopItems('light');
  const previewAudio = getTopItems('audio');

  return (
    <>
      <JsonLd
        data={[studioFaqSchema, studioBreadcrumbSchema, studioPricingSchema]}
      />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-16 lg:py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-500">
                <Building2 className="h-4 w-4" />
                Studio Rental
              </div>
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                Premium Studio
                <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Space Rental
                </span>
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Professional photography and video studio with state-of-the-art
                equipment and flexible booking options.
              </p>
              <a
                href={generateWhatsAppLink('studio')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-amber-500 px-8 py-4 font-semibold text-foreground transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/50"
              >
                Book Your Slot
              </a>
            </div>
          </div>
        </section>

        <StudioCarousel />

        {/* Services */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-4 text-center text-4xl font-bold">
              Our Services
            </h2>
            <p className="mb-16 text-center text-muted-foreground">
              Everything you need under one roof
            </p>

            {/* Space Allocation / Pricing Engine */}
            <StudioPricingEngine equipment={equipment} />

            {/* Podcast Studio */}
            <div className="mb-20">
              <div className="mb-8 flex items-center gap-3">
                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1 text-sm font-semibold text-green-500">
                  Podcast Studio
                </span>
                <div className="h-px flex-1 bg-secondary" />
              </div>
              <p className="mb-8 text-muted-foreground text-lg">
                Broadcast-quality podcast recording with professional acoustics,
                premium microphones, and expert support.
              </p>

              <div className="mb-12">
                <h3 className="mb-6 text-2xl font-bold">Studio Equipment</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {podcastEquipment.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-border bg-muted/30 p-5 flex items-start gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                        <item.icon className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="mb-6 text-2xl font-bold">Recording Packages</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {podcastPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`relative rounded-2xl border p-6 flex flex-col ${
                      pkg.popular
                        ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_15px_-5px_hsl(var(--color-green)/0.15)]'
                        : 'border-border bg-muted/50'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-6 rounded-full bg-green-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                        Most Popular
                      </span>
                    )}
                    <h4 className="mb-2 text-xl font-bold">{pkg.name}</h4>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-green-500">
                        ₹{pkg.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {pkg.duration}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3 flex-1">
                      {pkg.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-green-500 font-bold">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={generateWhatsAppLink(
                        'studio',
                        `Hi! I'd like to book the ${pkg.name} podcast package in your studio.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                        pkg.popular
                          ? 'bg-green-500 text-foreground hover:bg-green-400'
                          : 'border border-green-500/40 bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      }`}
                    >
                      Book Session
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Rental */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-semibold text-amber-400">
                  Equipment Rental
                </span>
                <div className="h-px flex-1 bg-secondary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: 'Cameras', desc: previewCameras },
                  { title: 'Lenses', desc: previewLenses },
                  { title: 'Lighting', desc: previewLighting },
                  { title: 'Audio', desc: previewAudio },
                ].map((s) => (
                  <div
                    key={s.title}
                    className="flex flex-col justify-between rounded-xl border border-border bg-muted/50 p-6"
                  >
                    <div>
                      <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                    <a
                      href={generateWhatsAppLink(
                        'studio',
                        `Hi! I'd like to inquire about renting ${s.title}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-center text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
                    >
                      Browse &amp; Rent
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Facilities */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-4xl font-bold">
              Studio Facilities
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {facilities.map((facility, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-muted/50 p-6 text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                      <facility.icon className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{facility.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {facility.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BackdropsGallery />

        {/* Testimonials */}
        <Testimonials testimonials={studioTestimonials} accentColor="amber" />

        {/* Process Timeline */}
        <ProcessTimeline steps={studioProcessSteps} accentColor="amber" />

        {/* FAQ */}
        <ServiceFAQ faqs={studioFAQs} accentColor="amber" />
        <ServiceTerms type="studio" />
        <BookingFlyout service="studio" />
        <Footer />
      </main>
    </>
  );
}
