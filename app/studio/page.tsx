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

            {/* Services */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-4 text-center text-4xl font-bold">Our Services</h2>
                    <p className="mb-16 text-center text-zinc-400">Everything you need under one roof</p>

                    {/* Space Allocation */}
                    <div className="mb-16">
                        <div className="mb-6 flex items-center gap-3">
                            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm font-semibold text-purple-400">
                                Space Allocation
                            </span>
                            <div className="h-px flex-1 bg-zinc-800" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { title: 'Hourly', desc: 'Minimum 2 hours · Basic lighting · WiFi · Changing room', badge: null },
                                { title: 'Half Day', desc: '4 hours · All lighting · Multiple backdrops · Makeup area', badge: 'Most Popular' },
                                { title: 'Full Day', desc: '8 hours · All equipment · Flexible scheduling · Refreshments', badge: null },
                            ].map((s) => (
                                <div key={s.title} className={`relative flex flex-col justify-between rounded-xl border p-6 ${s.badge ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
                                    {s.badge && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-4 py-1 text-xs font-semibold text-white">
                                            {s.badge}
                                        </span>
                                    )}
                                    <div>
                                        <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                                        <p className="text-sm text-zinc-400">{s.desc}</p>
                                    </div>
                                    <a
                                        href={generateWhatsAppLink('studio', `Hi! I'd like to book the ${s.title} studio package.`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-block rounded-full bg-purple-500 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-purple-400"
                                    >
                                        Book Now
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Podcast Studio */}
                    <div className="mb-16">
                        <div className="mb-6 flex items-center gap-3">
                            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1 text-sm font-semibold text-green-400">
                                Podcast Studio
                            </span>
                            <div className="h-px flex-1 bg-zinc-800" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { title: 'Solo Creator', desc: 'Single host setup · Multi-track recording · Basic editing' },
                                { title: 'Interview Setup', desc: '2–3 guests · Video recording option · Multi-camera angles' },
                                { title: 'Full Production', desc: 'Up to 4 guests · 4K video · Advanced editing · Same-day delivery' },
                            ].map((s) => (
                                <div key={s.title} className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                                    <div>
                                        <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                                        <p className="text-sm text-zinc-400">{s.desc}</p>
                                    </div>
                                    <a
                                        href={generateWhatsAppLink('studio', `Hi! I'd like to inquire about the Podcast ${s.title} package.`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-block rounded-full border border-green-500/40 bg-green-500/10 px-5 py-2.5 text-center text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20"
                                    >
                                        Get Quote
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
                            <div className="h-px flex-1 bg-zinc-800" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { title: 'Cameras', desc: 'Sony A7 IV, Canon R6, Sony FX3 cinema body' },
                                { title: 'Lenses', desc: 'Sony GM zooms, Sigma Art primes, cinema glass' },
                                { title: 'Lighting', desc: 'Aputure & Godox LED, strobe kits, modifiers' },
                                { title: 'Audio', desc: 'Rode shotguns, Zoom recorders, wireless lavs' },
                            ].map((s) => (
                                <div key={s.title} className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                                    <div>
                                        <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                                        <p className="text-sm text-zinc-400">{s.desc}</p>
                                    </div>
                                    <a
                                        href={generateWhatsAppLink('studio', `Hi! I'd like to inquire about renting ${s.title}.`)}
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
