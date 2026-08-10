import type { Metadata } from 'next';
import Script from 'next/script';
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
import { getStudioPackages, getStudioAddOns } from '@/actions/studio-pricing';
import { BackdropsGallery } from '@/components/studio/BackdropsGallery';
import ServiceTerms from '@/components/sections/ServiceTerms';

import { JsonLd } from '@/lib/schema-helpers';

// This page fetches live equipment via a cookie-based Supabase client, so it
// must render per-request. Marking it dynamic stops the build-time
// DYNAMIC_SERVER_USAGE error and ensures the equipment section always loads.
export const dynamic = 'force-dynamic';

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
  title: 'Photography Studio Rental in Coimbatore | 1200 Sq Ft | RS Puram | Book by Hour',
  description:
    'A Professional Photography Studio Built for Creators in Coimbatore. Rent our premium 1200 sq ft studio space with Profoto lighting, infinity wall, and backdrops. Book by the hour.',
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
    'studio with Profoto lighting Coimbatore',
    'studio rental with equipment included',
  ],
  openGraph: {
    title: 'Photography Studio Rental in Coimbatore | 1200 Sq Ft | RS Puram | Book by Hour',
    description:
      'A Professional Photography Studio Built for Creators in Coimbatore. Rent our premium 1200 sq ft studio space with Profoto lighting, infinity wall & backdrops.',
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
      name: 'What is the studio rental price per hour in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our hourly studio rental starts at ₹999/hr. Half Day (4 hrs) is ₹3,499 and Full Day (8 hrs) is ₹6,999. All packages include lights, tripod and studio space.',
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
  'name': 'Photography Studio Rental Coimbatore',
  'image': 'https://wanderingkite.in/images/studiospace/infinity.webp',
  'description': 'Rent our premium 1200 sq ft photography and video studio in RS Puram, Coimbatore. Infinity wall, Profoto lighting, and flexible hourly booking.',
  'provider': {
    '@type': 'LocalBusiness',
    '@id': 'https://wanderingkite.in/#business',
    'name': 'Wandering Kite',
  },
  'areaServed': { '@type': 'City', 'name': 'Coimbatore' },
  'offers': [
    {
      '@type': 'Offer',
      'name': 'Hourly Studio Rental',
      'price': '1500',
      'priceCurrency': 'INR',
      'priceSpecification': {
        '@type': 'UnitPriceSpecification',
        'price': '1500',
        'priceCurrency': 'INR',
        'unitText': 'HOUR',
      },
    },
    {
      '@type': 'Offer',
      'name': 'Half Day Studio Rental',
      'price': '6000',
      'priceCurrency': 'INR',
    },
    {
      '@type': 'Offer',
      'name': 'Full Day Studio Rental',
      'price': '10000',
      'priceCurrency': 'INR',
    },
  ],
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '5',
    'bestRating': '5',
    'worstRating': '1',
    'ratingCount': '5',
  },
  'review': [
    {
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': 'Aarav',
      },
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': '5',
        'bestRating': '5',
        'worstRating': '1',
      },
      'reviewBody': 'I searched for the best wedding photographer in Coimbatore and found Wandering Kite. Their team showed immense professionalism throughout our big day, delivering stunning wedding photography coverage. They are truly the top photography studio in Coimbatore!',
    },
    {
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': 'Dia',
      },
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': '5',
        'bestRating': '5',
        'worstRating': '1',
      },
      'reviewBody': 'Rented their RS Puram studio for a product photography shoot. The infinity wall and Profoto lighting setup were phenomenal. Easily the best photography studio rental in Coimbatore.',
    },
    {
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': 'Kabir',
      },
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': '5',
        'bestRating': '5',
        'worstRating': '1',
      },
      'reviewBody': 'We came from Tirupur and hired Wandering Kite for a corporate shoot. The experience was seamless from start to finish. They are hands down the best commercial photographer in Tamil Nadu we have worked with.',
    },
    {
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': 'Meera',
      },
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': '5',
        'bestRating': '5',
        'worstRating': '1',
      },
      'reviewBody': 'Booked the studio for a full-day YouTube and brand content shoot. The 1200 sq ft space, 14ft ceilings, and equipment included in the package made the day so productive. Perfect for content creators in Coimbatore!',
    },
    {
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': 'Rohan',
      },
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': '5',
        'bestRating': '5',
        'worstRating': '1',
      },
      'reviewBody': 'We needed a newborn and maternity photographer in Coimbatore. The team showed amazing warmth and patience with our baby, and the portraits delivered were of exceptional quality. Highly recommended!',
    },
  ],
};

const facilities = [
  {
    icon: Maximize,
    title: 'AC Studio Space',
    description: 'Spacious 1200 sq ft studio space with 14ft ceilings.',
  },
  {
    icon: Lightbulb,
    title: 'Professional Lighting',
    description: 'Continuous & strobe lighting setups featuring Profoto gear.',
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

export default async function StudioPage() {
  // Fetch live equipment summary and filter for Studio Space Rental gear
  let rentalEquipment: any[] = [];
  try {
    const allEquipment = await getEquipment();
    rentalEquipment = allEquipment.filter(
      (eq: any) => eq.available_for_studio === true
    );
  } catch (error) {
    console.error('Failed to fetch equipment for studio page:', error);
  }

  const [studioPackages, studioAddOns] = await Promise.all([
    getStudioPackages(),
    getStudioAddOns(),
  ]);

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
      <Script id="fb-pixel-studio" strategy="afterInteractive">
        {`
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
      </Script>
      <noscript dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=863723466283459&ev=PageView&noscript=1" />` }} />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-16 lg:py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-500">
                <Building2 className="h-4 w-4" />
                Studio Rental
              </div>
              <h1 className="mb-6 font-bold leading-tight">
                <span className="block text-3xl sm:text-4xl md:text-5xl text-white mb-3">
                  Photography Studio Space
                </span>{' '}
                <span className="block text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Rental Place in Coimbatore
                </span>{' '}
                <span className="block text-sm sm:text-base md:text-lg font-semibold text-white/70 mt-3">
                  1200 Sq Ft | RS Puram | Book by Hour
                </span>
              </h1>
              <h2 className="mb-8 leading-relaxed font-normal max-w-3xl mx-auto">
                <span className="block text-base sm:text-lg text-amber-400 font-medium">
                  A Professional Photography Studio Built for Creators in Coimbatore
                </span>{' '}
                <span className="block text-sm sm:text-base text-muted-foreground mt-1">
                  Looking for the best photography studio for rent in Coimbatore? Studiospace offers a premium 1200 sq ft studio near RS Puram with Profoto lighting, infinity wall &amp; 9 backdrops. Book by the hour, half day or full day.
                </span>
              </h2>
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
              Check our competitive photo studio rental Coimbatore price options to book photography studio Coimbatore sessions today. Everything you need under one roof.
            </p>

            <StudioPricingEngine equipment={rentalEquipment} packages={studioPackages as any} addOns={studioAddOns as any} />

            {/* Podcast Studio */}
            <div className="mb-20">
              <div className="mb-8 flex items-center gap-3">
                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1 text-sm font-semibold text-green-500">
                  Podcast Studio
                </span>
                <div className="h-px flex-1 bg-secondary" />
              </div>
              <p className="mb-8 text-muted-foreground text-lg">
                Located in RS Puram, our studio provides a professional environment for podcast recording, video production, and photography, serving clients across Coimbatore, Tiruppur, Salem, and Erode.
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
