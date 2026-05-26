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
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
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
    name: 'Single Cameraman',
    price: '1,998',
    duration: '/hour',
    features: [
      'Studio space rent included (₹999)',
      '1 Cameraman (₹999)',
      '1 Camera',
      '3 Lights & 1 Mic',
    ],
  },
  {
    name: 'Double Cameraman',
    price: '2,997',
    duration: '/hour',
    features: [
      'Studio space rent included (₹999)',
      '2 Cameramen (₹999 each)',
      '2 Cameras',
      '3 Lights & 1 Mic',
    ],
    popular: true,
  },
  {
    name: 'Triple Cameraman',
    price: '3,996',
    duration: '/hour',
    features: [
      'Studio space rent included (₹999)',
      '3 Cameramen (₹999 each)',
      '3 Cameras',
      '3 Lights & 1 Mic',
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
      name: 'How much does it cost to rent the photography studio in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hourly rate starts at ₹999 (minimum 1 hour). Half-day (4 hours) is ₹3,500, and a full day (8 hours) is ₹6,999 (included gst). All packages include lighting equipment and WiFi.',
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
      name: 'Is parking available at the Coimbatore studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Parking space for 1 car and 2 bikes is available at our studio location. The studio is situated in a secure area, and additional parking options may also be available nearby when needed.',
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
      name: 'Does the studio have a green screen and infinity wall?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, the 1200 sq ft studio features a infinity wall, green screen, and multiple seamless paper backdrops. The 14ft ceilings allow for a wide range of lighting setups.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you allow food and drinks in the studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, but only in the designated lounge area. No food or drinks near equipment or shooting area to prevent damage.',
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
    description: 'UPS power backup available for shoots',
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

  // Hardcoded equipment previews for the rental section below
  const previewCameras = 'Sony A7 IV, Canon EOS R5, Lumix S5 IIX ,Sony Alpha M7 V,Sony Alpha FX3 , Sony Alpha FX 30';
  const previewLenses = 'Sony 24-70mm f/2.8, Canon 50mm f/1.2, Sigma 35mm Art';
  const previewLighting = 'Godox AD600 Pro, Aputure 300d II, Profoto B10X';
  const previewAudio = 'Rode NTG4+, DJI Mic 2, Zoom H6 Essential';

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
                className="inline-block rounded-full bg-amber-500 px-8 py-4 font-semibold text-zinc-950 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/50"
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

              {/* Studio Equipment - Commented out as requested
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
              */}

              <h3 className="mb-6 text-2xl font-bold">Packages with Cameraman</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {podcastPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`relative rounded-2xl border p-6 flex flex-col ${pkg.popular
                      ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_15px_-5px_hsl(var(--color-green)/0.15)]'
                      : 'border-border bg-muted/50'
                      }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-6 rounded-full bg-green-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
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
                      aria-label={`Book the ${pkg.name} podcast package`}
                      className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${pkg.popular
                        ? 'bg-green-500 text-zinc-950 hover:bg-green-400'
                        : 'border border-green-500/40 bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        }`}
                    >
                      Book Session
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Editing Services */}
            <div className="mb-16">
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm font-semibold text-purple-400">
                  Post-Production
                </span>
                <div className="h-px flex-1 bg-secondary" />
              </div>

              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <h3 className="mb-4 text-3xl font-bold tracking-tight">Premium Editing Services</h3>
                  <p className="mb-4 text-muted-foreground text-lg leading-relaxed">
                    Professional video and photo post-production tailored to your specific requirements.
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-semibold text-purple-400">
                    <Sparkles className="h-4 w-4" />
                    Pricing is customized entirely based on your workload and deliverables.
                  </div>
                </div>
                <div className="shrink-0">
                  <a
                    href={generateWhatsAppLink(
                      'studio',
                      `Hi! I'd like to get a customized quote for editing services.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105 hover:bg-purple-400"
                  >
                    Request a Quote <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-lg hover:shadow-purple-500/5">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-110 group-hover:bg-purple-500/20">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold">Hourly Basis</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Flexible editing designed for minor tweaks, short-form content, and quick turnarounds.
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-lg hover:shadow-purple-500/5">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-110 group-hover:bg-purple-500/20">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold">Project Basis</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    End-to-end post-production with a fixed scope and clear professional deliverables.
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-lg hover:shadow-purple-500/5">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-110 group-hover:bg-purple-500/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold">Customized</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tailored workflows designed exclusively for heavy workloads and retainer models.
                  </p>
                </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
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
        <Footer account="studio" />
      </main>
    </>
  );
}
