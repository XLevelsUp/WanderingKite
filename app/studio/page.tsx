import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { studioTestimonials, studioProcessSteps, studioFAQs } from '@/lib/service-page-data';
import { Building2, Maximize, Lightbulb, Wifi } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Photography Studio Rental Coimbatore | 1200 sq ft | Wandering Kite',
    description: 'Rent our fully-equipped 1200 sq ft photography and video studio in Coimbatore. Professional lighting, backdrops, and amenities. Hourly and daily rates available.',
    keywords: [
        'photography studio rental Coimbatore',
        'video studio rental Coimbatore',
        'studio space near me',
        'photo studio Coimbatore',
        'studio rental Tamil Nadu',
        'photography studio India',
        'video production studio Coimbatore',
        'studio space rental India',
    ],
    openGraph: {
        title: 'Premium Studio Space Rental Coimbatore',
        description: 'Professional 1200 sq ft studio facilities for photography and video production in Coimbatore',
        images: ['/og-studio.jpg'],
    },
};

const facilities = [
    { icon: Maximize, title: '1200 sq ft Space', description: 'Spacious studio with 14ft ceilings' },
    { icon: Lightbulb, title: 'Professional Lighting', description: 'Continuous & strobe lighting setups' },
    { icon: Building2, title: 'Multiple Backdrops', description: 'White, black, and colored seamless paper' },
    { icon: Wifi, title: 'High-Speed WiFi', description: 'Fast internet for tethered shooting' },
];

const pricingTiers = [
    {
        name: 'Hourly',
        price: '1,500',
        duration: '/hour',
        features: ['Minimum 2 hours', 'Basic lighting included', 'WiFi access', 'Changing room'],
    },
    {
        name: 'Half Day',
        price: '6,000',
        duration: '/4 hours',
        features: ['4 hours studio time', 'All lighting equipment', 'Multiple backdrops', 'Makeup area'],
        popular: true,
    },
    {
        name: 'Full Day',
        price: '10,000',
        duration: '/8 hours',
        features: ['8 hours studio time', 'All equipment included', 'Flexible scheduling', 'Refreshments'],
    },
];

export default function StudioPage() {
    return (
        <main className="min-h-screen bg-zinc-950 pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-500">
                            <Building2 className="h-4 w-4" />
                            Studio Rental
                        </div>
                        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                            Premium Studio
                            <br />
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Space Rental
                            </span>
                        </h1>
                        <p className="mb-8 text-xl text-zinc-400">
                            Professional photography and video studio with state-of-the-art equipment
                            and flexible booking options.
                        </p>
                        <a
                            href={generateWhatsAppLink('studio')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-full bg-purple-500 px-8 py-4 font-semibold text-white transition-all hover:bg-purple-400 hover:shadow-lg hover:shadow-purple-500/50"
                        >
                            Book Your Slot
                        </a>
                    </div>
                </div>
            </section>

            {/* Facilities */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Studio Facilities</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {facilities.map((facility, index) => (
                            <div key={index} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                        <facility.icon className="h-6 w-6 text-purple-500" />
                                    </div>
                                </div>
                                <h3 className="mb-2 text-lg font-bold">{facility.title}</h3>
                                <p className="text-sm text-zinc-400">{facility.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Pricing</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {pricingTiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative rounded-2xl border p-8 ${tier.popular
                                    ? 'border-purple-500 bg-purple-500/5'
                                    : 'border-zinc-800 bg-zinc-900/50'
                                    }`}
                            >
                                {tier.popular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-4 py-1 text-xs font-semibold text-white">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-purple-500">₹{tier.price}</span>
                                    <span className="text-zinc-400">{tier.duration}</span>
                                </div>
                                <ul className="mb-8 space-y-3">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                                            <span className="text-purple-500">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href={generateWhatsAppLink('studio', `Hi! I'd like to book the ${tier.name} studio package.`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${tier.popular
                                        ? 'bg-purple-500 text-white hover:bg-purple-400'
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

            {/* What's Included */}
            <section className="border-t border-zinc-800 bg-zinc-900/30 py-24">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-8 text-center text-4xl font-bold">What's Included</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                                <h3 className="mb-3 font-bold text-purple-500">Equipment</h3>
                                <ul className="space-y-2 text-sm text-zinc-300">
                                    <li>• Continuous LED lights (3x)</li>
                                    <li>• Strobe lights (2x)</li>
                                    <li>• Light stands & modifiers</li>
                                    <li>• Reflectors & diffusers</li>
                                </ul>
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                                <h3 className="mb-3 font-bold text-purple-500">Amenities</h3>
                                <ul className="space-y-2 text-sm text-zinc-300">
                                    <li>• Changing/makeup room</li>
                                    <li>• High-speed WiFi</li>
                                    <li>• Air conditioning</li>
                                    <li>• Free parking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials testimonials={studioTestimonials} accentColor="purple" />

            {/* Process Timeline */}
            <ProcessTimeline steps={studioProcessSteps} accentColor="purple" />

            {/* FAQ */}
            <ServiceFAQ faqs={studioFAQs} accentColor="purple" />

            <BookingFlyout service="studio" />
            <Footer />
        </main>
    );
}
