import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { EquipmentCard } from '@/components/services/EquipmentCard';
import { equipmentCatalog } from '@/lib/equipment-data';
import { rentalsTestimonials, rentalsProcessSteps, rentalsFAQs } from '@/lib/service-page-data';
import { Video, Shield, Headphones } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Camera & Equipment Rentals Coimbatore | Sony, Canon | Wandering Kite',
    description: 'Rent professional cameras, lenses, lighting, and audio equipment in Coimbatore. Sony, Canon, Rode available. Daily & weekly rates. Serving Coimbatore and Tamil Nadu.',
    keywords: [
        'camera rental Coimbatore',
        'DSLR rent Coimbatore',
        'photography equipment rental Coimbatore',
        'lens rental Coimbatore',
        'lighting rental India',
        'audio equipment rental',
        'Sony camera rental Coimbatore',
        'Canon lens rental India',
        'camera rental near me',
        'video equipment rental Tamil Nadu',
    ],
    openGraph: {
        title: 'Professional Camera & Equipment Rentals Coimbatore',
        description: 'Premium photography and video equipment for rent in Coimbatore',
        images: ['/og-rentals.jpg'],
    },
};

export default function RentalsPage() {
    const cameras = equipmentCatalog.filter(e => e.category === 'camera');
    const lenses = equipmentCatalog.filter(e => e.category === 'lens');
    const lighting = equipmentCatalog.filter(e => e.category === 'lighting');
    const audio = equipmentCatalog.filter(e => e.category === 'audio');

    return (
        <main className="min-h-screen bg-zinc-950 pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-500">
                            <Video className="h-4 w-4" />
                            Equipment Rentals
                        </div>
                        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                            Professional Camera &
                            <br />
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                Equipment Rentals
                            </span>
                        </h1>
                        <p className="mb-8 text-xl text-zinc-400">
                            Access premium photography and video gear without the commitment.
                            Daily and weekly rates available.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Rent From Us */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Why Rent From Us</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                                    <Shield className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="mb-3 text-xl font-bold">Insured Equipment</h3>
                            <p className="text-zinc-400">
                                All gear is insured and well-maintained for your peace of mind.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                                    <Video className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="mb-3 text-xl font-bold">Latest Gear</h3>
                            <p className="text-zinc-400">
                                Sony, Canon, and other premium brands updated regularly.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                                    <Headphones className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="mb-3 text-xl font-bold">24/7 Support</h3>
                            <p className="text-zinc-400">
                                Quick response via WhatsApp for any technical questions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cameras */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-4xl font-bold">Cameras</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {cameras.map(equipment => (
                            <EquipmentCard key={equipment.id} {...equipment} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Lenses */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-4xl font-bold">Lenses</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {lenses.map(equipment => (
                            <EquipmentCard key={equipment.id} {...equipment} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Lighting */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-4xl font-bold">Lighting</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {lighting.map(equipment => (
                            <EquipmentCard key={equipment.id} {...equipment} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Audio */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-4xl font-bold">Audio Equipment</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {audio.map(equipment => (
                            <EquipmentCard key={equipment.id} {...equipment} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Rental Terms */}
            <section className="border-t border-zinc-800 bg-zinc-900/30 py-24">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-8 text-center text-4xl font-bold">Rental Terms</h2>
                        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500">•</span>
                                <p className="text-zinc-300">
                                    <strong>Booking:</strong> Reserve via WhatsApp at least 24 hours in advance
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500">•</span>
                                <p className="text-zinc-300">
                                    <strong>Security Deposit:</strong> Refundable deposit required for all rentals
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500">•</span>
                                <p className="text-zinc-300">
                                    <strong>Pickup/Delivery:</strong> Flexible pickup times or delivery available (charges apply)
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500">•</span>
                                <p className="text-zinc-300">
                                    <strong>Late Returns:</strong> Additional charges apply for late returns
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials testimonials={rentalsTestimonials} accentColor="blue" />

            {/* Process Timeline */}
            <ProcessTimeline steps={rentalsProcessSteps} accentColor="blue" />

            {/* FAQ */}
            <ServiceFAQ faqs={rentalsFAQs} accentColor="blue" />

            <BookingFlyout service="rentals" />
            <Footer />
        </main>
    );
}
