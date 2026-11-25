import type { Metadata } from 'next';
import { AfterInteraction } from '@/components/analytics/AfterInteraction';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { StudioReviews } from '@/components/studio/StudioReviews';
import { StudioProcess } from '@/components/studio/StudioProcess';
import { StudioFAQ } from '@/components/studio/StudioFAQ';
import { PodcastBand } from '@/components/studio/PodcastBand';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import {
  studioTestimonials,
  studioProcessSteps,
  studioFAQs,
} from '@/lib/service-page-data';
import { getStudioEquipmentCached, getStudioPackagesCached, getStudioAddOnsCached, getPodcastPackagesCached } from '@/lib/studio-data';

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
import { InstagramSection } from '@/components/sections/InstagramSection';
import { SectionBoundary } from '@/components/shared/SectionBoundary';
import { StudioPricingEngine } from '@/components/studio/StudioPricingEngine';
import { BackdropsGallery } from '@/components/studio/BackdropsGallery';
import ServiceTerms from '@/components/sections/ServiceTerms';

import { JsonLd, buildReviewSchema } from '@/lib/schema-helpers';

// Pricing + equipment come from cached, cookie-free reads (lib/studio-data.ts), so the page is pre-built and
// refreshed every 5 minutes (ISR) instead of rendered on every request — ~1.2s faster first byte on mobile.
export const revalidate = 300;

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

export const metadata: Metadata = {
  title: 'Photography Studio Rental in Coimbatore | 1200 Sq Ft | RS Puram | Book by Hour',
  description:
    'A Professional Photography Studio Built for Creators in Coimbatore. Rent our premium 1200 sq ft studio space with Godox lighting, infinity wall, and backdrops. Book by the hour.',
  keywords: [
    // Core local terms
    'photography studio rental Coimbatore',
    'studio space for rent Coimbatore',
    'photo studio RS Puram Coimbatore',
    'video studio rental Coimbatore',
    // Size/spec-based queries
    '1200 sq ft studio Coimbatore',
    'studio with infinity wall Coimbatore',
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
    'studio with Godox lighting Coimbatore',
    'studio rental with equipment included',
  ],
  openGraph: {
    title: 'Photography Studio Rental in Coimbatore | 1200 Sq Ft | RS Puram | Book by Hour',
    description:
      'A Professional Photography Studio Built for Creators in Coimbatore. Rent our premium 1200 sq ft studio space with Godox lighting, infinity wall & backdrops.',
    url: 'https://www.wanderingkite.in/studiospace',
    images: [{ url: '/og-studio.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://www.wanderingkite.in/studiospace',
  },
};

const buildStudioFaqSchema = (priceAnswer: string) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the studio rental price per hour in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: priceAnswer,
      },
    },
    {
      '@type': 'Question',
      name: 'What equipment is included in the studio rental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lights, stands, modifiers, reflectors and 9 backdrops are all included. Extra gear like cameras, lenses and gimbals can be rented as add-ons inside the studio.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the studio suitable for YouTube videos and corporate shoots?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Our 1200 sq ft studio with 14ft ceilings and infinity wall is perfect for YouTube videos, corporate shoots, reels and music videos.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is the studio located? Can people from Tirupur and Erode visit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We are at RS Puram, Coimbatore. Free parking available. Clients from Tirupur, Erode and Salem visit us regularly — easy to reach within an hour.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use the studio for fashion or product photography?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! We have 9 backdrops, an infinity wall, white backdrop, professional lighting and a makeup room — perfect for fashion shoots, product photography and brand content.',
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
      name: 'Can I cancel or reschedule my studio booking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cancellations 72+ hours in advance receive a 100% refund. 48–72 hours: 75% refund. 24–48 hours: 50% refund. Less than 24 hours: no refund. One free reschedule is allowed if done 48+ hours in advance.',
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
});

const studioBreadcrumbSchema = {
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
      name: 'Studio Space Rental',
      item: 'https://www.wanderingkite.in/studiospace',
    },
  ],
};

const buildStudioPricingSchema = (hourly: number, halfDay: number, fullDay: number) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://www.wanderingkite.in/studiospace#service',
  'name': 'Photography Studio Rental Coimbatore',
  'image': 'https://www.wanderingkite.in/images/studiospace/infinity.webp',
  'description': 'Rent our premium 1200 sq ft photography and video studio in RS Puram, Coimbatore. Infinity wall, Godox lighting, and flexible hourly booking.',
  'provider': {
    '@type': 'LocalBusiness',
    '@id': 'https://www.wanderingkite.in/#business',
    'name': 'Wandering Kite',
  },
  'areaServed': { '@type': 'City', 'name': 'Coimbatore' },
  'offers': [
    {
      '@type': 'Offer',
      'name': 'Hourly Studio Rental',
      'price': String(hourly),
      'priceCurrency': 'INR',
      'priceSpecification': {
        '@type': 'UnitPriceSpecification',
        'price': String(hourly),
        'priceCurrency': 'INR',
        'unitText': 'HOUR',
      },
    },
    {
      '@type': 'Offer',
      'name': 'Half Day Studio Rental',
      'price': String(halfDay),
      'priceCurrency': 'INR',
    },
    {
      '@type': 'Offer',
      'name': 'Full Day Studio Rental',
      'price': String(fullDay),
      'priceCurrency': 'INR',
    },
  ],
  ...buildReviewSchema(studioTestimonials),
});

const facilities = [
  {
    icon: Maximize,
    title: 'AC Studio Space',
    description: 'Spacious 1200 sq ft studio space with 14ft ceilings.',
  },
  {
    icon: Lightbulb,
    title: 'Professional Lighting',
    description: 'Continuous & strobe lighting setups featuring Godox gear.',
  },
  {
    icon: Building2,
    title: 'Multiple Backdrops',
    description: 'White, black, and colored seamless paper available.',
  },
  {
    icon: Wifi,
    title: 'High-Speed WiFi',
    description: 'Fast internet for tethered shooting and content creators.',
  },
  {
    icon: Shirt,
    title: 'Changing Room',
    description: 'Dedicated makeup and changing area in our RS Puram location.',
  },
  {
    icon: Zap,
    title: 'Power Backup',
    description: 'UPS power backup available for uninterrupted shoots.',
  },
  {
    icon: Box,
    title: 'Infinity Wall',
    description: 'Professional infinity wall setup for seamless backgrounds.',
  },
  {
    icon: PanelsTopLeft,
    title: 'Movable Walls',
    description: 'Flexible custom backdrop solutions for video and photo shoots.',
  },
];

const pricingTiers = [
  {
    name: 'Hourly studio rental Coimbatore',
    price: '1,500',
    duration: '/hour',
    features: [
      'Minimum 1 hour',
      'Basic lighting included',
      'studio space for rent Coimbatore options',
      'Changing room',
    ],
  },
  {
    name: 'Half day studio rental Coimbatore',
    price: '6,000',
    duration: '/4 hours',
    features: [
      '4 hours studio time',
      'All lighting equipment',
      'studio space for rent options',
      'Makeup area',
    ],
    popular: true,
  },
  {
    name: 'Studio rental with equipment included Coimbatore',
    price: '10,000',
    duration: '/8 hours',
    features: [
      '8 hours studio time',
      'Studio rental with equipment included',
      'Equipment included',
      'Flexible scheduling',
    ],
  },
];

// Same container width steps as the landing page.
const WRAP = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16';

export default async function StudioPage() {
  // Fetch live equipment summary and filter for Studio Space Rental gear
  let rentalEquipment: any[] = [];
  try {
    // Already filtered to studio gear, names cleaned, photos as 800px thumbnails (lib/studio-data.ts).
    rentalEquipment = await getStudioEquipmentCached();
  } catch (error) {
    console.error('Failed to fetch equipment for studio page:', error);
  }

  // Each fetch falls back to [] on its own, so a database/network failure can't throw the whole page into error.tsx.
  const settle = (r: PromiseSettledResult<any[]>, label: string) => {
    if (r.status === 'fulfilled') return r.value;
    console.error(`Failed to fetch ${label} for studio page:`, r.reason);
    return [];
  };
  const [pkgRes, addOnRes, podcastRes] = await Promise.allSettled([
    getStudioPackagesCached(),
    getStudioAddOnsCached(),
    getPodcastPackagesCached(),
  ]);
  const studioPackages = settle(pkgRes, 'studio packages');
  const studioAddOns = settle(addOnRes, 'studio add-ons');
  const podcastRows = settle(podcastRes, 'podcast packages');

  // Keep FAQ copy and JSON-LD schemas synced with live studio_packages prices.
  const findPkgPrice = (match: RegExp, fallback: number) => {
    const pkg = (studioPackages as any[]).find(
      (p) => match.test(String(p.duration_label ?? '')) || match.test(String(p.name ?? ''))
    );
    const val = Number(pkg?.price);
    return Number.isFinite(val) && val > 0 ? val : fallback;
  };
  const hourlyPrice = findPkgPrice(/per\s*hour|quick/i, 999);
  const halfDayPrice = findPkgPrice(/4\s*hours|creator/i, 3999);
  const fullDayPrice = findPkgPrice(/8\s*hours|production/i, 7999);
  const formatInr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const priceFaqAnswer = `Our hourly studio rental starts at ${formatInr(hourlyPrice)}/hr. Half Day (4 hrs) is ${formatInr(halfDayPrice)} and Full Day (8 hrs) is ${formatInr(fullDayPrice)}. All packages include lights, tripod and studio space.`;
  const syncedFaqs = studioFAQs.map((faq, idx) =>
    idx === 0 ? { ...faq, answer: priceFaqAnswer } : faq
  );
  const studioFaqSchema = buildStudioFaqSchema(priceFaqAnswer);
  const studioPricingSchema = buildStudioPricingSchema(hourlyPrice, halfDayPrice, fullDayPrice);

  // The engine's SidePackage shape is camelCase; Supabase returns snake_case.
  // original_price stays null when unset so the discount badge stays hidden.
  const podcastPackages = (podcastRows as any[]).map((p) => ({
    name: p.name,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    durationLabel: p.duration_label,
    description: p.description,
    features: p.features ?? [],
    popular: p.is_popular,
  }));

  // Aligned with the live studio equipment catalogue above (Sony, Sigma, Godox, Hollyland, DJI)
  const previewCameras = 'Sony Alpha 7 M5, Sony ILME FX-3, DJI Pocket 3, Insta360 X5';
  const previewLenses = 'Sony G-Master 24mm / 35mm / 50mm / 85mm f/1.4, Sigma 24-70mm f/2.8';
  const previewLighting = 'Godox AD600 Pro II, Godox AD-200 Pro II, Godox SK400V, Godox RGB LC1000R, Nanlite Wand';
  const previewAudio = 'Hollyland Lark 2, Sony ECM-M1';

  return (
    <>
      <JsonLd
        data={[studioFaqSchema, studioBreadcrumbSchema, studioPricingSchema]}
      />
      {/* Studio Pixel loads on the first interaction (or after 8s) so its ~210 KB / ~200ms of main-thread work
          never competes with page load — same approach as the photography pages (AfterInteraction). */}
      <AfterInteraction
        id="fb-pixel-studio"
        code={`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '863723466283459');
          fbq('track', 'PageView');
        `}
      />
      <noscript dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=863723466283459&ev=PageView&noscript=1" />` }} />
      <main className="min-h-screen bg-background">
        {/* Order: reels → wording → studio carousel. Reels open the page, so they clear the fixed header. */}
        <InstagramSection account="studio" first />

        {/* Hero copy — headline left, intro + CTA right from lg; stacked on phones. 48/64/80 above, 64/80/96 below. */}
        <section>
          <div className={`${WRAP} grid gap-10 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-12 lg:items-end lg:gap-16 lg:pb-24 lg:pt-20`}>
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-deep/50 bg-primary-deep/15 px-3 py-1.5 text-xs font-semibold text-accent-text">
                <Building2 className="h-3.5 w-3.5" />
                Studio Rental
              </div>
              <h1 className="mt-6 font-bold leading-tight tracking-[-0.02em]">
                <span className="block text-3xl text-foreground sm:text-4xl lg:text-[2.75rem]">
                  Photography Studio Space
                </span>{' '}
                <span className="mt-2 block text-2xl text-accent-text sm:text-3xl">
                  Rental Place in Coimbatore
                </span>{' '}
                {/* Same words as before, shown as three chips; the " | " separators stay in the text for SEO/screen readers. */}
                <span className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-foreground">
                  {['1200 Sq Ft', 'RS Puram', 'Book by Hour'].map((t, i) => (
                    <span key={t} className="inline-flex items-center">
                      {i > 0 && <span className="sr-only"> | </span>}
                      <span className="rounded-full border border-border bg-card px-3 py-1.5">{t}</span>
                    </span>
                  ))}
                </span>
              </h1>
            </div>
            <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
              <h2 className="font-normal leading-relaxed">
                <span className="block text-base font-medium text-accent-text">
                  A Professional Photography Studio Built for Creators in Coimbatore
                </span>{' '}
                <span className="mt-2 block text-base text-muted-foreground">
                  Looking for the best photography studio for rent in Coimbatore? Studiospace offers a premium 1200 sq ft studio near RS Puram with Godox lighting, infinity wall &amp; 9 backdrops. Book by the hour, half day or full day.
                </span>
              </h2>
              <a
                href={generateWhatsAppLink('studio')}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-primary-deep to-primary px-7 text-sm font-semibold text-primary-foreground transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.6)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Book Your Slot
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Studio photos after the wording; the footer's Instagram block is switched off below so the feed shows once. */}
        <StudioCarousel first={false} />

        {/* Services */}
        <section aria-labelledby="studio-services-heading">
          <div className={`${WRAP} py-16 sm:py-20 lg:py-24`}>
            {/* Heading left, intro right on lg so the row spans the full width instead of leaving the right half empty. */}
            <div className="grid gap-4 lg:grid-cols-12 lg:items-start lg:gap-16">
              <h2 id="studio-services-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:col-span-4">
                Our Services
              </h2>
              <div className="space-y-4 lg:col-span-8">
                <p className="text-base leading-relaxed text-muted-foreground">
                  Check our competitive photo studio rental Coimbatore price options to book photography studio Coimbatore sessions today. Everything you need under one roof.
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Located in RS Puram, our studio provides a professional environment for podcast recording, video production, and photography, serving clients across Coimbatore, Tiruppur, Salem, and Erode.
                </p>
              </div>
            </div>

            <div id="studio-pricing" className="mt-12 scroll-mt-24 lg:mt-16">
              {/* If pricing crashes, only this block swaps to a WhatsApp prompt; the rest of the page stays up. */}
              <SectionBoundary
                name="studio-pricing"
                fallback={
                  <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
                    <p className="text-base text-muted-foreground">Live pricing is unavailable right now. Message us for current rates.</p>
                    <a
                      href={generateWhatsAppLink('studio')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-primary-deep to-primary px-6 text-sm font-semibold text-primary-foreground transition-[filter] duration-200 hover:brightness-110"
                    >
                      Book Your Slot <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                }
              >
                <StudioPricingEngine
                  equipment={rentalEquipment}
                  packages={studioPackages as any}
                  addOns={studioAddOns as any}
                  sidePackages={podcastPackages}
                  sidePackagesTitle="Podcast Studio — Packages with Cameraman"
                  sidePackagesService="studio"
                />
              </SectionBoundary>
            </div>

            {/* Editing Services */}
            <div className="mt-16 lg:mt-24">
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-primary-deep/50 bg-primary-deep/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
                  Post-Production
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Premium Editing Services</h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    Professional video and photo post-production tailored to your specific requirements.
                  </p>
                  <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-accent-text">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                    Pricing is customized entirely based on your workload and deliverables.
                  </div>
                </div>
                <a
                  href={generateWhatsAppLink('studio', `Hi! I'd like to get a customized quote for editing services.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic
                  className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-gradient-to-r from-primary-deep to-primary px-6 text-sm font-semibold text-primary-foreground transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.6)] active:scale-[0.97] md:self-auto"
                >
                  Request a Quote <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-6">
                {[
                  { icon: Clock, title: 'Hourly Basis', body: 'Flexible editing designed for minor tweaks, short-form content, and quick turnarounds.' },
                  { icon: Layers, title: 'Project Basis', body: 'End-to-end post-production with a fixed scope and clear professional deliverables.' },
                  { icon: Sparkles, title: 'Customized', body: 'Tailored workflows designed exclusively for heavy workloads and retainer models.' },
                ].map((c) => (
                  <div key={c.title} className="group rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/40 lg:p-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-deep/20 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <h4 className="mt-6 text-lg font-semibold text-foreground">{c.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Rental */}
            <div className="mt-16 lg:mt-24">
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-primary-deep/50 bg-primary-deep/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
                  Equipment Rental
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {[
                  { title: 'Cameras', desc: previewCameras },
                  { title: 'Lenses', desc: previewLenses },
                  { title: 'Lighting', desc: previewLighting },
                  { title: 'Audio', desc: previewAudio },
                ].map((s) => (
                  <div key={s.title} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                    <a
                      href={generateWhatsAppLink('studio', `Hi! I'd like to inquire about renting ${s.title}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-5 text-sm font-semibold text-accent-text transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
                    >
                      Browse &amp; Rent
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Podcast Studio lives inside the studio; linked here, not only from the footer. */}
        <PodcastBand />

        {/* Facilities */}
        <section aria-labelledby="facilities-heading" className="border-t border-border">
          <div className={`${WRAP} py-16 sm:py-20 lg:py-24`}>
            <h2 id="facilities-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Studio Facilities
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:mt-16 lg:grid-cols-4 lg:gap-6">
              {facilities.map((facility, index) => (
                <div key={index} className="group rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/40">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-deep/20 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <facility.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground">{facility.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{facility.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BackdropsGallery />

        {/* Testimonials */}
        <StudioReviews reviews={studioTestimonials} />

        {/* Process Timeline */}
        <StudioProcess steps={studioProcessSteps} />

        {/* FAQ */}
        <StudioFAQ faqs={syncedFaqs} service="studio" />
        <ServiceTerms type="studio" />
        <BookingFlyout service="studio" />
        <Footer account="studio" showInstagram={false} />
      </main>
    </>
  );
}
