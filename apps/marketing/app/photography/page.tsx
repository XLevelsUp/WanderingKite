import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Camera, Monitor, Video } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { HeroFilm } from '@/components/photography/HeroFilm';
import { FilmApproach } from '@/components/photography/FilmApproach';
import { GearList } from '@/components/photography/GearList';
import { PhotoReviews } from '@/components/photography/PhotoReviews';
import { PhotoProcess } from '@/components/photography/PhotoProcess';
import { PhotoFAQ } from '@/components/photography/PhotoFAQ';
import { PhotoClosing } from '@/components/photography/PhotoClosing';
import { PhotoMotion } from '@/components/photography/PhotoMotion';
import { BlogPreview } from '@/components/photography/BlogPreview';
import { StoriesInLight } from '@/components/photography/StoriesInLight';
import { FeaturedStories } from '@/components/photography/FeaturedStories';
import { StudioRows } from '@/components/photography/StudioRows';
import { PHOTO_WRAP } from '@/components/photography/PhotoChrome';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { JsonLd } from '@/lib/schema-helpers';
import { photographyTestimonials } from '@/lib/service-page-data';
import { getAlbums, getCatalog } from '@/lib/photography/data';

export const metadata: Metadata = {
  title: 'Best Photographers in Coimbatore | Wedding, Events & Commercial',
  description:
    'Looking for professional photographers in Coimbatore? Wandering Kite covers weddings, events, products, portraits & more. Based in RS Puram. View our portfolio and book today.',
  keywords: [
    // Answer the Public: "photographer in / near / for" patterns
    'photographer in Coimbatore',
    'photographer near RS Puram',
    'best wedding photographer Coimbatore',
    'event photographer Coimbatore',
    'portrait photographer Coimbatore',
    // Service-specific
    'wedding photography Coimbatore',
    'product photography Coimbatore',
    'corporate photography Coimbatore',
    'newborn photography Coimbatore',
    'maternity photography Coimbatore',
    // Commercial / content
    'commercial photographer Tamil Nadu',
    'brand photography Coimbatore',
    'social media content photographer Coimbatore',
    'headshot photographer Coimbatore',
    'music video production Coimbatore',
    // Neighboring cities
    'photographer Tirupur',
    'wedding photographer Salem',
    'event photography Erode',
    // Intent signals
    'hire photographer Coimbatore',
    'photography packages Coimbatore price',
  ],
  openGraph: {
    title: 'Best Photographers in Coimbatore | Wedding, Events & Commercial',
    description:
      'Looking for professional photographers in Coimbatore? Wandering Kite covers weddings, events, products, portraits & more. Based in RS Puram. View our portfolio and book today.',
    url: 'https://wanderingkite.in/photography',
    images: [{ url: '/og-photography.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Photographers in Coimbatore | Wedding, Events & Commercial',
    description:
      'Looking for professional photographers in Coimbatore? Wandering Kite covers weddings, events, products, portraits & more. Based in RS Puram. View our portfolio and book today.',
    images: ['/og-photography.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://wanderingkite.in/photography',
  },
};

const photographyFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How far in advance should I book a photographer in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For events and weddings in Coimbatore, we recommend booking at least 30 days in advance. For lifestyle and portrait sessions, 7–14 days is usually sufficient. Last-minute bookings may be accommodated based on availability.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you travel outside Coimbatore for destination shoots?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We cover destination weddings and events across India including Tirupur, Salem, Erode, and beyond. Travel and accommodation costs are additional and will be included in your custom quote.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many edited photos will I receive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This varies by package: Events (200–300 photos), Weddings (500–800 photos), Lifestyle sessions (50–100 photos). All photos are professionally edited and color-corrected.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I request specific photography styles or shot lists?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! During the consultation, share your Pinterest boards, reference photos, or specific must-have shots. We will create a shot list to ensure we capture everything you want.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the photography delivery timeline?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Within 7–10 days, you receive professionally edited high-resolution images via cloud link.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the advance payment required to confirm a photography booking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A 30% advance payment secures your date. The remaining balance is due on or before the day of the shoot.',
      },
    },
  ],
};

const photographyBreadcrumbSchema = {
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
      name: 'Photography',
      item: 'https://wanderingkite.in/photography',
    },
  ],
};

const photographyServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://wanderingkite.in/photography#service',
  'name': 'Wandering Kite Photography Services',
  'image': 'https://wanderingkite.in/images/photography/events.webp',
  'description': "Book Coimbatore's top wedding, event & commercial photographers. High-quality wedding photography, product shoots, and corporate headshots.",
  'provider': {
    '@type': 'LocalBusiness',
    '@id': 'https://wanderingkite.in/#business',
    'name': 'Wandering Kite',
  },
  'offers': {
    '@type': 'Offer',
    'url': 'https://wanderingkite.in/photography',
    'priceCurrency': 'INR',
    'price': 'Custom',
    'priceSpecification': {
      '@type': 'UnitPriceSpecification',
      'price': 'Call for Quote',
    },
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '5',
    'bestRating': '5',
    'worstRating': '1',
    'ratingCount': '7',
  },
  'review': [
    {
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': 'Athira Haridaso' },
      'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5', 'worstRating': '1' },
      'reviewBody': 'We booked this wonderful team for our marriage, and we are extremely happy with how everything turned out! ❤️\n\nEvery single picture is so beautiful and has captured our special moments so naturally. We’ve already shared a few photos with our friends and cousins, and everyone has been loving them and complimenting how amazing they are! 😍\n\nA big thank you to Sandy Anna, Bala Anna, the Anna who kept encouraging us with all those amazing attitude poses 😁, the light man, and everyone else who was part of the team. We truly appreciate all the effort, patience, creativity, and hard work you put into capturing our wedding memories so beautifully.\n\nWe are genuinely so happy and grateful with the final results. You have given us memories that we will cherish forever. ❤️✨\n\nThank you so much to the entire team, and highly recommended for anyone looking for a talented and dedicated wedding photography team!',
    },
    {
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': 'Yashaswini Thanigai Kumaran' },
      'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5', 'worstRating': '1' },
      'reviewBody': 'We booked them for our baby shower, and we absolutely loved their work. The photos turned out absolutely beautiful. The team was incredibly creative, professional, and friendly, making us feel comfortable throughout the entire session.\n\nTruly satisfied with their work and would definitely love to work with them again for our future celebrations. Highly recommended!',
    },
    {
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': 'mohammed Irshad' },
      'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5', 'worstRating': '1' },
      'reviewBody': 'We are beyond impressed with the exceptional work of our product image photographer. Their keen eye for detail, creative composition, and mastery of lighting have truly elevated the visual appeal of our products. Each image captures the essence of quality, bringing out the finest features with clarity and precision.\n\nTheir professionalism, dedication, and ability to understand our vision made the entire process seamless. Whether it was adjusting angles for the perfect shot or ensuring consistency across different products, their expertise shone through. Thanks to their outstanding work, our product visuals now reflect the high standards we uphold, making a strong impact on our customers.\n\nHighly recommended for anyone looking for top-tier product photography. We look forward to working with them again in the future!',
    },
    {
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': 'Asha Shanmugapriya' },
      'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5', 'worstRating': '1' },
      'reviewBody': 'Team were friendly and their work is really good.. thanks Sandy and team for capturing our wonderful memories ❤',
    },
    {
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': 'hygiene Sales' },
      'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5', 'worstRating': '1' },
      'reviewBody': 'Great photo shoot work done for my Bloomvitalia handmade premium luxury soaps',
    },
    {
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': 'Vengadesh S' },
      'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5', 'worstRating': '1' },
      'reviewBody': 'Great price',
    },
    {
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': 'Pooja kp' },
      'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5', 'worstRating': '1' },
      'reviewBody': 'Reasonable price Great',
    },
  ],
};


const processSteps = [
  {
    number: '1',
    title: 'Initial Consultation',
    description:
      "Contact us via WhatsApp to discuss your requirements, vision, and preferred dates. We'll provide a custom quote based on your needs.",
  },
  {
    number: '2',
    title: 'Booking Confirmation',
    description:
      "Once you approve the quote, we'll send a booking agreement and invoice. A 30% advance secures your date.",
  },
  {
    number: '3',
    title: 'The Shoot',
    description:
      'On the day, our photographer arrives early to capture every moment. We work unobtrusively to get authentic, candid shots.',
  },
  {
    number: '4',
    title: 'Post Production',
    description:
      'Our team of editors meticulously selects and enhances the best images from your shoot. We focus on natural color correction, subtle retouching, and preserving the authentic mood of the moment.',
  },
  {
    number: '5',
    title: 'Delivery',
    description:
      'Within 7-10 days, receive professionally edited high-resolution images via cloud link.',
  },
];

const faqs = [
  {
    question: 'How far in advance should I book?',
    answer:
      'For events and weddings, we recommend booking at least 30 days in advance. For lifestyle and portrait sessions, 7-14 days is usually sufficient. Last-minute bookings may be accommodated based on availability.',
  },
  {
    question: 'Do you travel for destination shoots?',
    answer:
      'Yes! We cover destination weddings and events across India. Travel and accommodation costs are additional and will be included in your custom quote.',
  },
  {
    question: 'How many edited photos will I receive?',
    answer:
      'This varies by package: Events (200-300 photos), Weddings (500-800 photos), Lifestyle sessions (50-100 photos). All photos are professionally edited and color-corrected.',
  },
  {
    question: 'Can I request specific shots or styles?',
    answer:
      "Absolutely! During the consultation, share your Pinterest boards, reference photos, or specific must-have shots. We'll create a shot list to ensure we capture everything you want.",
  },
  {
    question: 'What if the weather is bad on the shoot day?',
    answer:
      'For outdoor shoots, we monitor weather forecasts closely. If conditions are unfavorable, we can reschedule at no extra cost or suggest indoor alternatives/backup locations.',
  },
];

// The hub reads live albums; static, refreshed every 5 minutes.
export const revalidate = 300;

// Equipment copy carried over verbatim from the previous page.
const gear = [
  { icon: Monitor, title: 'Cameras', body: 'Sony A7 M5, Sony FX3, DJI Pocket 3 Creator Combo, Action Camera Insta360 One X2 Essentials Bundle' },
  { icon: Camera, title: 'Lenses', body: 'Sony G Master 85mm 1.4, Sony G Master 35mm 1.4, Sony G Master 50mm 1.4, Sony G Master 24mm 1.4, Sony G Master 16mm 1.4, Sony G Master 90mm macro 2.8' },
  { icon: Video, title: 'Lighting & Grip', body: 'SK400 V, AD600 pro2, AD200 pro2, Digitek Stripe Light, Nantu Pro, Nantu,' },
];

export default async function PhotographyPage() {
  const [cat, featured, latest] = await Promise.all([
    getCatalog(),
    getAlbums({ featured: true, pageSize: 6 }),
    getAlbums({ pageSize: 6 }),
  ]);
  // Featured albums first (Admin → "Feature on Photography home"), topped up with the newest.
  const stories = [...featured.albums, ...latest.albums.filter((a) => !featured.albums.some((f) => f.id === a.id))].slice(0, 4);

  return (
    <>
      <JsonLd data={[photographyFaqSchema, photographyBreadcrumbSchema, photographyServiceSchema]} />
      <main>
        {/* ── Hero: viewfinder film — copy left, uncropped 16:9 film right (lg); H1/H2 text unchanged from the previous page. ── */}
        <section aria-label="Introduction" className="overflow-hidden">
          <div className={`${PHOTO_WRAP} grid gap-12 pb-12 pt-28 sm:pb-16 sm:pt-32 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-20 lg:pt-36`}>
            <div className="lg:col-span-5">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">
                <Camera className="h-3.5 w-3.5" aria-hidden />
                Photography Services
              </p>
              <div className="mt-6"><StoriesInLight variant="line" /></div>
              <h1 className="mt-6 font-bold leading-tight tracking-[-0.02em]">
                <span className="block text-3xl text-foreground sm:text-4xl lg:text-[2.75rem]">Best Photographers in Coimbatore</span>
                <span className="mt-2 block text-xl font-semibold text-accent-text sm:text-2xl">Wedding, Events &amp; Commercial</span>
              </h1>
              <h2 className="mt-6 font-normal leading-relaxed">
                <span className="block text-base font-medium text-foreground">Looking for professional photographers in Coimbatore?</span>
                <span className="mt-1 block text-base text-foreground/80">
                  Wandering Kite covers weddings, events, product photography, portraits &amp; more, tailored to your needs. Based in RS Puram. View our portfolio and book today.
                </span>
              </h2>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href={generateWhatsAppLink('photography')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Book a photography session with Wandering Kite Studio in Coimbatore"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[filter,transform] duration-200 hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Book a Session
                </a>
                <a
                  href="#explore"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/30 px-6 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View our portfolio
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <HeroFilm src="/videos/weddings-film.webm" poster="/images/photography/weddings-film-poster.webp" label="Temple wedding · Wandering Kite" />
            </div>
          </div>

          {/* Slow category ticker (transform-only CSS loop; static for reduced motion). */}
          <div aria-hidden className="border-y border-border bg-card py-4">
            <div className="flex w-max motion-safe:animate-[ticker_60s_linear_infinite]">
              {[0, 1].map((k) => (
                <ul key={k} className="flex shrink-0 items-center">
                  {cat.categories.map((c) => (
                    <li key={`${k}-${c.id}`} className="flex items-center gap-6 px-3 text-sm font-medium text-foreground/70">
                      {c.name}
                      <span className="h-1 w-1 rounded-full bg-accent-text" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* ── Explore: contact-sheet band per section (film strip of category frames from the DB). ── */}
        <StudioRows />

        {/* ── Everything below the corporate band: one light, animated sequence (porcelain ↔ white ↔ sand → sandstone footer). ── */}
        <PhotoMotion />
        <FilmApproach wrap={PHOTO_WRAP} />
        <StoriesInLight />
        <FeaturedStories albums={stories} wrap={PHOTO_WRAP} />
        <GearList gear={gear} wrap={PHOTO_WRAP} />
        <PhotoReviews reviews={photographyTestimonials} wrap={PHOTO_WRAP} />
        <PhotoProcess steps={processSteps} wrap={PHOTO_WRAP} />
        <BlogPreview wrap={PHOTO_WRAP} />
        <PhotoFAQ faqs={faqs} wrap={PHOTO_WRAP} />
        <PhotoClosing cities={cat.cities} wrap={PHOTO_WRAP} />
      </main>
      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}
