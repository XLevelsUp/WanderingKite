import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { createClient } from '@/lib/supabase/server';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { EquipmentCard } from '@/components/services/EquipmentCard';
import { getEquipment } from '@/actions/equipment-public';
import {
  rentalsTestimonials,
  rentalsProcessSteps,
  rentalsFAQs,
} from '@/lib/service-page-data';
import { JsonLd } from '@/lib/schema-helpers';
import { Video, Shield, Headphones } from 'lucide-react';
import { RentalCartProvider } from '@/components/rentals/RentalCartContext';
import { RentalCartSummary } from '@/components/rentals/RentalCartSummary';
import ServiceTerms from '@/components/sections/ServiceTerms';

export const metadata: Metadata = {
  title: 'Camera & Lens Rental Coimbatore | Sony, Canon, Rode | Daily Rates',
  description:
    'Rent Sony, Canon cameras, lenses, lighting & Rode audio gear in Coimbatore. Insured equipment. Customizable hourly, daily & weekly pricing plans. Delivery available. Book on WhatsApp.',
  keywords: [
    // Answer the Public: "rent / hire / borrow" camera patterns
    'camera rental Coimbatore',
    'rent camera near me Coimbatore',
    'DSLR rental Coimbatore',
    'mirrorless camera rental Coimbatore',
    'Sony A7 rental Coimbatore',
    'Canon R6 rental Coimbatore',
    // Lens-specific
    'lens rental Coimbatore',
    'prime lens rental Coimbatore',
    'zoom lens rental Tamil Nadu',
    // Lighting & audio
    'lighting equipment rental Coimbatore',
    'Rode microphone rental Coimbatore',
    'audio equipment rental Tamil Nadu',
    // Intent + comparison
    'camera rental per day Coimbatore',
    'camera rental with delivery Coimbatore',
    // Neighboring cities
    'camera rental Tirupur',
    'equipment rental near Erode',
    'photography gear rental Salem',
    // Purpose-based
    'camera rental for wedding Coimbatore',
    'video camera rental Coimbatore',
    'photography equipment rental Coimbatore',
  ],
  openGraph: {
    title: 'Camera & Equipment Rental Coimbatore | Sony, Canon, Rode',
    description:
      'Rent professional cameras, lenses & audio gear in Coimbatore. Daily & weekly rates. Insured & well-maintained.',
    url: 'https://wanderingkite.in/rentals',
    images: [{ url: '/og-rentals.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://wanderingkite.in/rentals',
  },
};

const rentalsFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What documents are required to rent a camera in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You will need a valid government-issued photo ID (Aadhaar, PAN, Driving License, or Passport) and proof of address. For high-value equipment, a secondary ID may also be requested.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I extend my camera rental period?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Contact us at least 2 hours before your rental ends. Extensions are subject to availability and charged at prorated rates.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the security deposit for camera rentals in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Security deposits vary by equipment value: ₹5,000–₹10,000 for cameras and lenses, ₹2,000–₹5,000 for lighting and audio equipment. Deposits are fully refundable upon safe return.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer delivery of rental equipment in Coimbatore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, delivery is available within Coimbatore city limits. Delivery charges range from ₹500–₹1,500 depending on distance and must be arranged 48 hours in advance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is insurance included with camera rentals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Basic insurance is included with all rentals. For complete coverage, purchase our optional damage waiver at 10% of the rental cost, which covers accidental damage (excludes theft and loss).',
      },
    },
    {
      '@type': 'Question',
      name: 'What camera brands are available for rent at Wandering Kite Studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We stock Sony, Canon, and Nikon camera bodies, along with prime and zoom lenses. Audio gear includes Rode and Shure microphones. Inventory is updated regularly with the latest professional equipment.',
      },
    },
  ],
};

const rentalsBreadcrumbSchema = {
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
      name: 'Camera & Equipment Rentals',
      item: 'https://wanderingkite.in/rentals',
    },
  ],
};

export default async function RentalsPage() {
  // 1. Fetch live data
  const remoteData = await getEquipment();

  // 2. Filter for External Rentals that are available for booking
  const externalRentals = remoteData.filter(
    (eq: any) => eq.is_rental === true
  );

  // 3. Format it to match the Card props
  const equipmentItems = externalRentals.map((e) => {
    let parsedSpecs: string[] = [];
    if (typeof e.specs === 'string') {
      try {
        parsedSpecs = JSON.parse(e.specs);
      } catch (err) {}
    } else if (Array.isArray(e.specs)) {
      parsedSpecs = e.specs as string[];
    }

    // The joined table 'categories' returns either { name: string } or an array of it due to the join
    const categoryName = e.category_name?.toLowerCase() || (e.categories as any)?.name?.toLowerCase() || '';

    return {
      id: e.id,
      name: e.name,
      category: categoryName,
      pricingPlans: Array.isArray((e as any).pricingPlans) ? (e as any).pricingPlans : [],
      hourlyRate: e.hourly_rate ? Number(e.hourly_rate) : 0,
      image: e.image_url || '',
      specs: parsedSpecs,
      available: e.status === 'AVAILABLE',
    };
  });

  const cameras = equipmentItems.filter(
    (e) => e.category === 'camera' || e.category === 'cameras'
  );
  const lenses = equipmentItems.filter(
    (e) => e.category === 'lens' || e.category === 'lenses'
  );
  const lighting = equipmentItems.filter(
    (e) => e.category === 'lighting' || e.category === 'lights'
  );
  const audio = equipmentItems.filter((e) => e.category === 'audio');
  const others = equipmentItems.filter(
    (e) =>
      e.category === 'others' ||
      e.category === 'other' ||
      e.category === 'accessories'
  );

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isRepeatClient = false;
  if (user && user.email) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .single();

    if (clientData) {
      const { count } = await supabase
        .from('rental_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientData.id);
      
      if (count && count > 0) {
        isRepeatClient = true;
      }
    }
  }

  // Fetch global settings
  const { getGlobalRentalPolicySettings } = await import('@/actions/rental-policy');
  const globalSettings = await getGlobalRentalPolicySettings();
  const discountPercentage = globalSettings?.repeat_client_discount_percentage || 0;
  const billingPolicy = globalSettings?.active_billing_policy || 'HOURLY';

  return (
    <RentalCartProvider 
      discountPercentage={discountPercentage} 
      billingPolicy={billingPolicy}
      isRepeatClient={isRepeatClient}
    >
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-500">
                <Video className="h-4 w-4" />
                Equipment Rentals
              </div>
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                Professional Camera &
                <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Equipment Rentals
                </span>
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Access premium photography and video gear without the
                commitment. Customizable hourly, daily, and weekly pricing plans.
              </p>
            </div>
          </div>
        </section>

        {/* Why Rent From Us */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-4xl font-bold">
              Why Rent From Us
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                    <Shield className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold">Insured Equipment</h3>
                <p className="text-muted-foreground">
                  All gear is insured and well-maintained for your peace of
                  mind.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                    <Video className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold">Latest Gear</h3>
                <p className="text-muted-foreground">
                  Sony, Canon, and other premium brands updated regularly.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                    <Headphones className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Quick response via WhatsApp for any technical questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cameras */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-4xl font-bold">Cameras</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cameras.map((equipment) => (
                <EquipmentCard key={equipment.id} {...equipment} />
              ))}
            </div>
          </div>
        </section>

        {/* Lenses */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-4xl font-bold">Lenses</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {lenses.map((equipment) => (
                <EquipmentCard key={equipment.id} {...equipment} />
              ))}
            </div>
          </div>
        </section>

        {/* Lighting */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-4xl font-bold">Lighting</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {lighting.map((equipment) => (
                <EquipmentCard key={equipment.id} {...equipment} />
              ))}
            </div>
          </div>
        </section>

        {/* Audio */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-4xl font-bold">Audio Equipment</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {audio.map((equipment) => (
                <EquipmentCard key={equipment.id} {...equipment} />
              ))}
            </div>
          </div>
        </section>

        {/* Others */}
        <section className="border-t border-border py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-4xl font-bold">
              Other Equipment & Accessories
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {others.map((equipment) => (
                <EquipmentCard key={equipment.id} {...equipment} />
              ))}
            </div>
          </div>
        </section>

        {/* Rental Terms */}
        <section className="border-t border-border bg-muted/30 py-24 pb-48">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-center text-4xl font-bold">
                Rental Terms
              </h2>
              <div className="space-y-4 rounded-2xl border border-border bg-muted/50 p-8">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500">•</span>
                  <p className="text-muted-foreground">
                    <strong>Booking:</strong> Reserve via WhatsApp at least 24
                    hours in advance
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500">•</span>
                  <p className="text-muted-foreground">
                    <strong>Security Deposit:</strong> Refundable deposit
                    required for all rentals
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500">•</span>
                  <p className="text-muted-foreground">
                    <strong>Pickup/Delivery:</strong> Flexible pickup times or
                    delivery available (charges apply)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500">•</span>
                  <p className="text-muted-foreground">
                    <strong>Late Returns:</strong> Additional charges apply for
                    late returns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials testimonials={rentalsTestimonials} accentColor="amber" />

        {/* Process Timeline */}
        <ProcessTimeline steps={rentalsProcessSteps} accentColor="amber" />

        {/* FAQ */}
        <ServiceFAQ faqs={rentalsFAQs} accentColor="amber" />
        <ServiceTerms type="rentals" />
        <BookingFlyout service="rentals" />
        <RentalCartSummary />
        <Footer />
      </main>
    </RentalCartProvider>
  );
}
