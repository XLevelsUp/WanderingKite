import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { podcastTestimonials, podcastProcessSteps, podcastFAQs } from '@/lib/service-page-data';
import { Mic, Headphones, Radio, Zap } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Podcast Recording Studio Coimbatore | Professional Audio | Wandering Kite',
    description: 'Professional podcast recording studio in Coimbatore with acoustic treatment, multi-track recording, and premium microphones. Hourly rates available. Serving Coimbatore and Tamil Nadu.',
    keywords: [
        'podcast studio Coimbatore',
        'podcast recording near me',
        'audio recording studio Coimbatore',
        'podcast production India',
        'podcast studio Tamil Nadu',
        'professional podcast recording Coimbatore',
        'audio production studio India',
        'podcast recording India',
    ],
    openGraph: {
        title: 'Podcast Recording Studio Coimbatore',
        description: 'Fully-equipped podcast studio with professional acoustics in Coimbatore',
        images: ['/og-podcast.jpg'],
    },
};

const equipment = [
    { icon: Mic, title: 'Premium Microphones', description: 'Rode Procaster & Shure SM7B' },
    { icon: Headphones, title: 'Studio Monitors', description: 'Closed-back headphones for all guests' },
    { icon: Radio, title: 'Multi-Track Recording', description: 'Zoom H6 & audio interface' },
    { icon: Zap, title: 'Acoustic Treatment', description: 'Professional soundproofing & panels' },
];

const packages = [
    {
        name: 'Solo Creator',
        price: '1,200',
        duration: '/hour',
        features: ['1 host setup', 'Single mic & headphones', 'Basic editing included', 'WAV file delivery'],
    },
    {
        name: 'Interview Setup',
        price: '1,800',
        duration: '/hour',
        features: ['2-3 person setup', 'Multiple mics', 'Video recording option', 'Multi-track files'],
        popular: true,
    },
    {
        name: 'Full Production',
        price: '5,000',
        duration: '/4 hours',
        features: ['Up to 4 guests', 'Video + audio', 'Professional editing', 'Same-day delivery'],
    },
];

export default function PodcastPage() {
    return (
        <main className="min-h-screen bg-zinc-950 pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-500">
                            <Mic className="h-4 w-4" />
                            Podcast Studio
                        </div>
                        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                            Podcast Recording
                            <br />
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                Studio
                            </span>
                        </h1>
                        <p className="mb-8 text-xl text-zinc-400">
                            Broadcast-quality podcast recording with professional acoustics,
                            premium microphones, and expert support.
                        </p>
                        <a
                            href={generateWhatsAppLink('podcast')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-full bg-green-500 px-8 py-4 font-semibold text-white transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/50"
                        >
                            Book Recording Session
                        </a>
                    </div>
                </div>
            </section>

            {/* Equipment & Features */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Studio Equipment</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {equipment.map((item, index) => (
                            <div key={index} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                                        <item.icon className="h-6 w-6 text-green-500" />
                                    </div>
                                </div>
                                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                                <p className="text-sm text-zinc-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Packages */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Recording Packages</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.name}
                                className={`relative rounded-2xl border p-8 ${pkg.popular
                                    ? 'border-green-500 bg-green-500/5'
                                    : 'border-zinc-800 bg-zinc-900/50'
                                    }`}
                            >
                                {pkg.popular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-4 py-1 text-xs font-semibold text-white">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="mb-2 text-2xl font-bold">{pkg.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-green-500">₹{pkg.price}</span>
                                    <span className="text-zinc-400">{pkg.duration}</span>
                                </div>
                                <ul className="mb-8 space-y-3">
                                    {pkg.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                                            <span className="text-green-500">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href={generateWhatsAppLink('podcast', `Hi! I'd like to book the ${pkg.name} podcast package.`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${pkg.popular
                                        ? 'bg-green-500 text-white hover:bg-green-400'
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

            {/* Technical Specs */}
            <section className="border-t border-zinc-800 bg-zinc-900/30 py-24">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-8 text-center text-4xl font-bold">Technical Specifications</h2>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 font-bold text-green-500">Audio Setup</h3>
                                    <ul className="space-y-2 text-sm text-zinc-300">
                                        <li>• Rode Procaster microphones</li>
                                        <li>• Shure SM7B (premium option)</li>
                                        <li>• Scarlett 4i4 audio interface</li>
                                        <li>• Zoom H6 multi-track recorder</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-3 font-bold text-green-500">Room Acoustics</h3>
                                    <ul className="space-y-2 text-sm text-zinc-300">
                                        <li>• Professional acoustic panels</li>
                                        <li>• Bass traps in corners</li>
                                        <li>• Isolated recording booth</li>
                                        <li>• Noise floor: -60dB</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-3 font-bold text-green-500">Video Option</h3>
                                    <ul className="space-y-2 text-sm text-zinc-300">
                                        <li>• Multi-camera setup (2-3 angles)</li>
                                        <li>• 4K video recording</li>
                                        <li>• Professional lighting</li>
                                        <li>• Green screen available</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-3 font-bold text-green-500">Amenities</h3>
                                    <ul className="space-y-2 text-sm text-zinc-300">
                                        <li>• High-speed WiFi</li>
                                        <li>• Air conditioning</li>
                                        <li>• Green room/lounge</li>
                                        <li>• Free parking</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials testimonials={podcastTestimonials} accentColor="green" />

            {/* Process Timeline */}
            <ProcessTimeline steps={podcastProcessSteps} accentColor="green" />

            {/* FAQ */}
            <ServiceFAQ faqs={podcastFAQs} accentColor="green" />

            <BookingFlyout service="podcast" />
            <Footer />
        </main>
    );
}
