import type { Metadata } from 'next';
import Link from 'next/link';
import { preload } from 'react-dom';
import { ArrowRight, Camera, Crosshair, Monitor, Video } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { HeroFilm } from '@/components/photography/HeroFilm';
import { HERO_POSTER, HERO_POSTER_SIZES, heroPosterSrcSet } from '@/lib/photography/hero-poster';
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
import { siteConfig } from '@/config/site';
import { openingHoursSchema } from '@/lib/hours';
import { brandSocials } from '@/lib/socials';
import { PortfolioGrid } from '@/components/photography/PortfolioGrid';
import { JsonLd, buildReviewSchema } from '@/lib/schema-helpers';
import { photographyTestimonials } from '@/lib/service-page-data';
import { getAlbums, getCatalog, getPortfolioPhotos } from '@/lib/photography/data';

const PAGE_URL = `${siteConfig.url}/photography`;
const TITLE = 'Wedding & Event Photographer in Coimbatore | Wandering Kite';
const DESCRIPTION =
  'Candid wedding, event, portrait and product photography from RS Puram, Coimbatore. See real albums, how we work and check your date on WhatsApp.';
const OG_IMAGE = { url: '/og-photography.jpg', width: 1200, height: 630, alt: 'Bride and groom at a temple wedding in Coimbatore, photographed by Wandering Kite' };

// Title is absolute (≈60 chars) so the layout's " | Wandering Kite Studio" template doesn't push it past what Google shows.
// No `keywords`: search engines ignore the tag and the audit flagged it as stuffing.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: null, // drop the site-wide (rental-heavy) keywords tag inherited from the root layout

  openGraph: {
    type: 'website',
    siteName: 'Wandering Kite Photography',
    locale: 'en_IN',
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitter,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
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
    canonical: PAGE_URL,
  },
};


const photographyBreadcrumbSchema = {
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
      name: 'Photography',
      item: 'https://www.wanderingkite.in/photography',
    },
  ],
};

const photographyServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://www.wanderingkite.in/photography#service',
  'name': 'Wandering Kite Photography Services',
  'image': 'https://www.wanderingkite.in/images/photography/events.webp',
  'description': 'Wedding, event, portrait, product and corporate photography from RS Puram, Coimbatore.',
  'provider': {
    '@type': 'LocalBusiness',
    '@id': 'https://www.wanderingkite.in/#business',
    'name': 'Wandering Kite',
  },
  ...buildReviewSchema(photographyTestimonials),
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
  {
    question: 'How much advance is needed to confirm a booking?',
    answer: 'A 30% advance secures your date. The balance is due on or before the day of the shoot.',
  },
];

// The hub reads live albums; static, refreshed every 5 minutes.
export const revalidate = 300;

// Equipment copy carried over verbatim from the previous page.
const gear = [
  { icon: Monitor, title: 'Cameras', body: 'Sony A7 M5, Sony A7 M4, Sony FX3, Sony FX30, DJI Pocket 3 Creator Combo, Action Camera Insta360 One X2 Essentials Bundle' },
  { icon: Camera, title: 'Lenses', body: 'Sony G Master 85mm 1.4, Sony G Master 35mm 1.4, Sony G Master 50mm 1.4, Sony G Master 24mm 1.4, Sony G Master 16mm 1.4, Sony G Master 90mm macro 2.8, Sigma Art 24-70mm 2.8, Tamron 17-28mm 2.8' },
  { icon: Video, title: 'Lighting & Grip', body: 'SK400 V, AD600 pro2, AD200 pro2, Digitek Stripe Light, Nantu Pro 450, Nantu Bi Color 450' },
  { icon: Crosshair, title: 'Stands and Stabilizers', body: 'Gimbal, Manfrotto Video Tripod, Manfrotto Photo Tripod' },
];

export default async function PhotographyPage() {
  // The hero film poster is the first big image on screen (LCP): fetch it at high priority instead of
  // waiting for the <video> element to be parsed and competing with lazy-loaded photos below.
  // Same srcSet/sizes as the <img>, so the browser preloads the copy it will actually use (800px on phones).
  preload(HERO_POSTER, { as: 'image', fetchPriority: 'high', imageSrcSet: heroPosterSrcSet(HERO_POSTER), imageSizes: HERO_POSTER_SIZES });
  const [cat, featured, latest, portfolio] = await Promise.all([
    getCatalog(),
    getAlbums({ featured: true, pageSize: 6 }),
    getAlbums({ pageSize: 6 }),
    getPortfolioPhotos(10),
  ]);
  // Featured albums first (Admin → "Feature on Photography home"), topped up with the newest.
  const stories = [...featured.albums, ...latest.albums.filter((a) => !featured.albums.some((f) => f.id === a.id))].slice(0, 4);

  // FAQPage is built from the same list the page renders, so the markup always matches the visible questions.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };

  // The photography business itself. schema.org has no "Photographer" business type, so this is
  // LocalBusiness + ProfessionalService; it points at the site-wide #business entity as its parent.
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${PAGE_URL}#photographer`,
    name: 'Wandering Kite Photography',
    description: DESCRIPTION,
    url: PAGE_URL,
    image: `${siteConfig.url}${OG_IMAGE.url}`,
    logo: `${siteConfig.url}/logo.svg`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.contact.address.street,
      addressLocality: 'Coimbatore',
      addressRegion: siteConfig.contact.address.state,
      postalCode: siteConfig.contact.address.zip,
      addressCountry: siteConfig.contact.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: siteConfig.geo.latitude, longitude: siteConfig.geo.longitude },
    openingHoursSpecification: openingHoursSchema(),
    areaServed: cat.cities.map((c) => ({ '@type': 'City', name: c.name })),
    // Google Business Profile first: ties this entity to the Maps listing and its 5★ reviews.
    hasMap: siteConfig.googleBusiness,
    sameAs: [siteConfig.googleBusiness, ...brandSocials.map((s) => s.href)],
    parentOrganization: { '@id': `${siteConfig.url}/#business` },
  };

  return (
    <>
      <JsonLd data={[businessSchema, faqSchema, photographyBreadcrumbSchema, photographyServiceSchema]} />
      <main>
        {/* ── Hero: viewfinder film — copy left, uncropped 16:9 film right (lg). ── */}
        <section aria-label="Introduction" className="overflow-hidden border-b border-border/60 bg-background">
          <div className={`${PHOTO_WRAP} grid gap-10 pb-12 pt-24 sm:pb-16 sm:pt-28 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-20 lg:pt-32`}>
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-text/25 bg-accent-text/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-text">
                <Camera className="h-3.5 w-3.5" aria-hidden />
                Photography Services
              </div>

              <h1 className="mt-5 font-bold leading-[1.08] tracking-[-0.03em]">
                <span className="block text-3xl text-foreground sm:text-4xl lg:text-[2.75rem]">Best Photographers in Coimbatore</span>
                <span className="mt-2 block text-lg font-semibold tracking-[-0.01em] text-accent-text sm:text-xl">Wedding, Events &amp; Commercial</span>
              </h1>

              <div className="mt-4">
                <StoriesInLight variant="line" />
              </div>

              {/* Intro is a paragraph, not an H2 (audit: headings should be short labels, not prose). */}
              <p className="mt-5 text-sm leading-relaxed sm:text-base">
                <span className="block font-medium text-foreground">Looking for professional photographers in Coimbatore?</span>
                <span className="mt-1.5 block text-foreground/75">
                  Wandering Kite covers weddings, events, product photography, portraits &amp; more, tailored to your needs. Based in RS Puram.
                </span>
              </p>

              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Photography specialties">
                {['Weddings', 'Events', 'Portraits', 'Commercial'].map((tag) => (
                  <li key={tag}>
                    <a
                      href="#portfolio"
                      className="inline-block rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-accent-text/50 hover:text-foreground"
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={generateWhatsAppLink('photography')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Book a Session with Wandering Kite Photography on WhatsApp"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-[filter,transform,box-shadow] duration-200 hover:brightness-95 hover:shadow-[0_12px_28px_-10px_hsl(var(--primary)/0.6)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Book a Session
                </a>
                <a
                  href="#portfolio"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View our portfolio
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <HeroFilm src="/videos/weddings-film.webm" poster={HERO_POSTER} label="Temple wedding · Wandering Kite" />
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

        {/* ── Portfolio: real photos with descriptive alt text ("View our portfolio" lands here). ── */}
        <PortfolioGrid photos={portfolio} wrap={PHOTO_WRAP} />

        {/* ── Everything below the corporate band: one light, animated sequence (porcelain ↔ white ↔ sand → sandstone footer). ── */}
        <PhotoMotion />
        <FilmApproach wrap={PHOTO_WRAP} />
        <StoriesInLight />
        {/* Far below the first screen: .cv-auto lets the browser skip layout/paint until they scroll near (globals.css). */}
        <div className="cv-auto"><FeaturedStories albums={stories} wrap={PHOTO_WRAP} /></div>
        <div className="cv-auto"><GearList gear={gear} wrap={PHOTO_WRAP} /></div>
        {/* Strongest (longest, most specific) reviews lead; one-line ones go last. */}
        <div className="cv-auto"><PhotoReviews reviews={[...photographyTestimonials].sort((x, y) => y.content.length - x.content.length)} wrap={PHOTO_WRAP} sourceUrl={siteConfig.googleReviews} /></div>
        <div className="cv-auto"><PhotoProcess steps={processSteps} wrap={PHOTO_WRAP} /></div>
        <div className="cv-auto"><BlogPreview wrap={PHOTO_WRAP} /></div>
        <div className="cv-auto"><PhotoFAQ faqs={faqs} wrap={PHOTO_WRAP} /></div>
        <div className="cv-auto"><PhotoClosing cities={cat.cities} wrap={PHOTO_WRAP} /></div>
      </main>
      <Footer showInstagram={false} tone="sandstone" section="photography" />
    </>
  );
}
