import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { JsonLd } from '@/lib/schema-helpers';
import { photographyTestimonials } from '@/lib/service-page-data';
import { Camera, Clock, MapPin, Video, Monitor } from 'lucide-react';
import { PortfolioCategories } from '@/components/sections/PortfolioCategories';
import ServiceTerms from '@/components/sections/ServiceTerms';

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
      'reviewBody': 'Rented their RS Puram studio for a product photography shoot. The cyclorama wall and Profoto lighting setup were phenomenal. Easily the best photography studio rental in Coimbatore.',
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

export default function PhotographyPage() {
  return (
    <>
      <JsonLd data={[photographyFaqSchema, photographyBreadcrumbSchema, photographyServiceSchema]} />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-500">
                <Camera className="h-4 w-4" />
                Photography Services
              </div>
              <h1 className="mb-6 font-bold leading-tight">
                <span className="block text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-3">
                  Best Photographers in Coimbatore
                </span>
                <span className="block text-xl sm:text-2xl md:text-3xl font-semibold text-white/70">
                  Wedding, Events &amp; Commercial
                </span>
              </h1>
              <h2 className="mb-8 leading-relaxed font-normal max-w-3xl mx-auto">
                <span className="block text-base sm:text-lg text-amber-400 font-medium">
                  Looking for professional photographers in Coimbatore?
                </span>
                <span className="block text-sm sm:text-base text-muted-foreground mt-1">
                  Wandering Kite covers weddings, events, product photography, portraits &amp; more, tailored to your needs. Based in RS Puram. View our portfolio and book today.
                </span>
              </h2>
              <a
                href={generateWhatsAppLink('photography')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Book a photography session with Wandering Kite Studio in Coimbatore"
                className="inline-block rounded-full bg-amber-500 px-8 py-4 font-semibold text-zinc-950 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/50"
              >
                Book a Session
              </a>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-4xl font-bold">
              Our Approach
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                  <Camera className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="mb-3 text-xl font-bold">
                  Authentic Storytelling
                </h3>
                <p className="text-muted-foreground">
                  Recognized among the Top 10 photographers in Coimbatore, we capture genuine emotions. Whether you are looking for the best wedding photographers in Coimbatore or creative portraits, we bring your unique story to life.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="mb-3 text-xl font-bold">
                  Reliable Quality
                </h3>
                <p className="text-muted-foreground">
                  Our team delivers professionally edited images within 7-10 days from our prime RS Puram location. We provide transparent photography packages Coimbatore price options to suit your exact needs.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                  <MapPin className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="mb-3 text-xl font-bold">
                  Regional Coverage
                </h3>
                <p className="text-muted-foreground">
                  From our RS Puram location, we serve clients across Coimbatore, Tiruppur, Salem, and Erode with professional wedding, event, portrait, and commercial photography.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-4xl font-bold">Categories</h2>
            <PortfolioCategories />
          </div>
        </section>

        {/* Services */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-4 text-center text-4xl font-bold">
              Our Services
            </h2>
            <p className="mb-16 text-center text-muted-foreground">
              Choose the session that fits your story
            </p>

            {/* ── Photography ──────────────────────────────────────── */}
            <div className="mb-16">
              {/* Events */}
              <div className="mb-10">
                <div className="mb-6 flex items-center gap-3">
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-semibold text-amber-500">
                    Event
                  </span>
                  <div className="h-px flex-1 bg-secondary" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      title: 'Wedding Photography',
                      desc: 'Premium photography packages crafted by top wedding photographers to beautifully capture your big day.',
                    },
                    {
                      title: 'Event Photography',
                      desc: 'Professional event photography for engagements, pre-weddings, birthdays, and special family celebrations.',
                    },
                    {
                      title: 'Candid & Traditional',
                      desc: 'A seamless blend of candid moments and traditional portraits for complete, comprehensive coverage.',
                    },
                  ].map((s) => (
                    <div
                      key={s.title}
                      className="flex flex-col justify-between rounded-xl border border-border bg-muted/50 p-6"
                    >
                      <div>
                        <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {s.desc}
                        </p>
                      </div>
                      <a
                        href={generateWhatsAppLink(
                          'photography',
                          `Hi! I'd like to inquire about ${s.title}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Get a quote for ${s.title}`}
                        className="mt-5 inline-block rounded-full bg-amber-500 px-5 py-2.5 text-center text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
                      >
                        Get Quote
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portraits */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-semibold text-amber-500">
                    Portraits
                  </span>
                  <div className="h-px flex-1 bg-secondary" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      title: 'Portrait Photography',
                      desc: 'Creative studio and outdoor portrait photography sessions tailored to showcase your personality.',
                    },
                    {
                      title: 'Maternity Photography',
                      desc: 'Elegant maternity photography sessions to beautifully document your journey to motherhood.',
                    },
                    {
                      title: 'Newborn Photography',
                      desc: 'Safe, gentle, and heartwarming newborn photography sessions to capture your little ones earliest days.',
                    },
                  ].map((s) => (
                    <div
                      key={s.title}
                      className="flex flex-col justify-between rounded-xl border border-border bg-muted/50 p-6"
                    >
                      <div>
                        <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {s.desc}
                        </p>
                      </div>
                      <a
                        href={generateWhatsAppLink(
                          'photography',
                          `Hi! I'd like to inquire about ${s.title}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Get a quote for ${s.title}`}
                        className="mt-5 inline-block rounded-full bg-amber-500 px-5 py-2.5 text-center text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
                      >
                        Get Quote
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Corporate ─────────────────────────────────────────── */}
            <div className="mb-16">
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-sm font-semibold text-blue-400">
                  Corporate
                </span>
                <div className="h-px flex-1 bg-secondary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: 'Product Photography',
                    desc: 'High-quality e-commerce and catalogue product photography for all your retail and branding needs.',
                  },
                  {
                    title: 'Music Video Production',
                    desc: 'Cinematic brand films, social reels, and full-scale music video production projects.',
                  },
                  {
                    title: 'Social Media Content',
                    desc: 'Platform-ready visual assets created by a dedicated social media content photographer.',
                  },
                  {
                    title: 'Corporate Photography',
                    desc: 'Professional corporate photography and creative brand photography to elevate your business identity.',
                  },
                  {
                    title: 'Headshot Photography',
                    desc: 'Clean, professional corporate headshots for executive teams and business founders.',
                  },
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
                        'photography',
                        `Hi! I'd like to inquire about ${s.title}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Get a quote for ${s.title}`}
                      className="mt-5 inline-block rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2.5 text-center text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
                    >
                      Get Quote
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Commercial ────────────────────────────────────────── */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm font-semibold text-purple-400">
                  Commercial
                </span>
                <div className="h-px flex-1 bg-secondary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: 'Ads',
                    desc: 'High-concept advertisement productions',
                  },
                  {
                    title: 'Music Videos',
                    desc: 'Full-production music videos with cinema kit',
                  },
                  {
                    title: 'Short Films',
                    desc: 'Narrative short film production & post',
                  },
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
                        'photography',
                        `Hi! I'd like to inquire about ${s.title}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Get a quote for ${s.title} production`}
                      className="mt-5 inline-block rounded-full border border-purple-500/40 bg-purple-500/10 px-5 py-2.5 text-center text-sm font-semibold text-purple-400 transition-colors hover:bg-purple-500/20"
                    >
                      Get Quote
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Equipment */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-4 text-4xl font-bold">Equipment We Use</h2>
              <p className="mb-12 text-muted-foreground">
                When you hire photographer Coimbatore services from Wandering Kite, we use industry-standard gear to ensure the highest quality results. Check our photography packages Coimbatore price lists.
              </p>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background p-8 text-center">
                  <Monitor className="mx-auto mb-4 h-8 w-8 text-amber-500" />
                  <h3 className="mb-2 font-bold text-lg">Cameras</h3>
                  <p className="text-sm text-muted-foreground">
                    Sony A7 M5, Sony FX3, DJI Pocket 3 Creator Combo, Action
                    Camera Insta360 One X2 Essentials Bundle
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-8 text-center">
                  <Camera className="mx-auto mb-4 h-8 w-8 text-amber-500" />
                  <h3 className="mb-2 font-bold text-lg">Lenses</h3>
                  <p className="text-sm text-muted-foreground">
                    Sony G Master 85mm 1.4, Sony G Master 35mm 1.4, Sony G
                    Master 50mm 1.4, Sony G Master 24mm 1.4, Sony G Master 16mm
                    1.4, Sony G Master 90mm macro 2.8
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-8 text-center">
                  <Video className="mx-auto mb-4 h-8 w-8 text-amber-500" />
                  <h3 className="mb-2 font-bold text-lg">
                    Lighting &amp; Grip
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    SK400 V, AD600 pro2, AD200 pro2, Digitek Stripe Light, Nantu
                    Pro, Nantu,
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials testimonials={photographyTestimonials} accentColor="amber" />

        {/* Process Timeline */}
        <ProcessTimeline steps={processSteps} accentColor="amber" />

        {/* FAQ */}
        <ServiceFAQ faqs={faqs} accentColor="amber" />
        <ServiceTerms type="photography" />
        <Footer />
      </main>
    </>
  );
}
