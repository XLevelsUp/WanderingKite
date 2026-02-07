import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { Camera, Clock, MapPin } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Event & Lifestyle Photography Coimbatore | Wandering Kite Studio',
    description: 'Professional event and lifestyle photography in Coimbatore and across India. Capturing authentic moments with creative storytelling. Wedding, portrait, and commercial photography services.',
    keywords: [
        'event photographer Coimbatore',
        'lifestyle photography Coimbatore',
        'wedding photography Coimbatore',
        'portrait photography Coimbatore',
        'commercial photography India',
        'photography services India',
        'event photography Tamil Nadu',
        'professional photographer Coimbatore',
    ],
    openGraph: {
        title: 'Event & Lifestyle Photography Coimbatore',
        description: 'Professional photography that captures authentic moments in Coimbatore and across India',
        images: ['/og-photography.jpg'],
    },
};

const portfolioImages = [
    { id: 1, category: 'Events', alt: 'Event photography sample' },
    { id: 2, category: 'Lifestyle', alt: 'Lifestyle photography sample' },
    { id: 3, category: 'Portraits', alt: 'Portrait photography sample' },
    { id: 4, category: 'Events', alt: 'Event photography sample' },
    { id: 5, category: 'Lifestyle', alt: 'Lifestyle photography sample' },
    { id: 6, category: 'Portraits', alt: 'Portrait photography sample' },
];

const testimonials = [
    {
        name: 'Priya & Rahul',
        role: 'Wedding Clients',
        content: 'The team captured our wedding beautifully! Every candid moment, every emotion - perfectly preserved. The photos exceeded our expectations.',
        rating: 5,
        service: 'Wedding Photography',
    },
    {
        name: 'Ankit Sharma',
        role: 'Startup Founder',
        content: 'Professional and creative. They understood our brand vision and delivered stunning product shots for our launch campaign.',
        rating: 5,
        service: 'Commercial Photography',
    },
    {
        name: 'Meera Patel',
        role: 'Content Creator',
        content: 'Best lifestyle shoot experience! The photographer made me feel comfortable and the results were Instagram-perfect. Highly recommend!',
        rating: 5,
        service: 'Lifestyle Photography',
    },
];

const processSteps = [
    {
        number: '1',
        title: 'Initial Consultation',
        description: 'Contact us via WhatsApp to discuss your requirements, vision, and preferred dates. We\'ll provide a custom quote based on your needs.',
    },
    {
        number: '2',
        title: 'Booking Confirmation',
        description: 'Once you approve the quote, we\'ll send a booking agreement and invoice. A 30% advance secures your date.',
    },
    {
        number: '3',
        title: 'The Shoot',
        description: 'On the day, our photographer arrives early to capture every moment. We work unobtrusively to get authentic, candid shots.',
    },
    {
        number: '4',
        title: 'Editing & Delivery',
        description: 'Within 7-10 days, receive professionally edited high-resolution images via cloud link. Unlimited revisions included.',
    },
];

const faqs = [
    {
        question: 'How far in advance should I book?',
        answer: 'For events and weddings, we recommend booking at least 30 days in advance. For lifestyle and portrait sessions, 7-14 days is usually sufficient. Last-minute bookings may be accommodated based on availability.',
    },
    {
        question: 'Do you travel for destination shoots?',
        answer: 'Yes! We cover destination weddings and events across India. Travel and accommodation costs are additional and will be included in your custom quote.',
    },
    {
        question: 'How many edited photos will I receive?',
        answer: 'This varies by package: Events (200-300 photos), Weddings (500-800 photos), Lifestyle sessions (50-100 photos). All photos are professionally edited and color-corrected.',
    },
    {
        question: 'Can I request specific shots or styles?',
        answer: 'Absolutely! During the consultation, share your Pinterest boards, reference photos, or specific must-have shots. We\'ll create a shot list to ensure we capture everything you want.',
    },
    {
        question: 'What if the weather is bad on the shoot day?',
        answer: 'For outdoor shoots, we monitor weather forecasts closely. If conditions are unfavorable, we can reschedule at no extra cost or suggest indoor alternatives/backup locations.',
    },
];

export default function PhotographyPage() {
    return (
        <main className="min-h-screen bg-zinc-950 pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-500">
                            <Camera className="h-4 w-4" />
                            Photography Services
                        </div>
                        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                            Event & Lifestyle
                            <br />
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                Photography
                            </span>
                        </h1>
                        <p className="mb-8 text-xl text-zinc-400">
                            Capturing authentic moments with creative storytelling. From events to portraits,
                            we create visual narratives that resonate.
                        </p>
                        <a
                            href={generateWhatsAppLink('photography')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-full bg-amber-500 px-8 py-4 font-semibold text-zinc-950 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/50"
                        >
                            Book a Session
                        </a>
                    </div>
                </div>
            </section>

            {/* Our Approach */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Our Approach</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <Camera className="h-6 w-6 text-amber-500" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold">Authentic Storytelling</h3>
                            <p className="text-zinc-400">
                                We capture genuine emotions and candid moments that tell your unique story.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <Clock className="h-6 w-6 text-amber-500" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold">Professional Delivery</h3>
                            <p className="text-zinc-400">
                                High-quality edited images delivered within 7-10 days of your session.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <MapPin className="h-6 w-6 text-amber-500" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold">On-Location Flexibility</h3>
                            <p className="text-zinc-400">
                                We travel to your venue or suggest stunning locations across India.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="border-t border-zinc-800 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Portfolio</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {portfolioImages.map((image) => (
                            <div
                                key={image.id}
                                className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-900"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <Camera className="mx-auto mb-2 h-12 w-12 text-zinc-700" />
                                        <p className="text-sm text-zinc-600">{image.category}</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-zinc-950 p-4 transition-transform group-hover:translate-y-0">
                                    <p className="text-sm font-semibold">{image.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services & Pricing */}
            <section className="border-t border-zinc-800 bg-zinc-900/30 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Services</h2>
                    <div className="mx-auto grid max-w-4xl gap-6">
                        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                            <div>
                                <h3 className="mb-2 text-xl font-bold">Event Photography</h3>
                                <p className="text-zinc-400">Weddings, corporate events, parties</p>
                            </div>
                            <a
                                href={generateWhatsAppLink('photography', "Hi! I'd like to inquire about event photography pricing.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
                            >
                                Get Quote
                            </a>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                            <div>
                                <h3 className="mb-2 text-xl font-bold">Lifestyle Shoots</h3>
                                <p className="text-zinc-400">Personal branding, family portraits</p>
                            </div>
                            <a
                                href={generateWhatsAppLink('photography', "Hi! I'd like to inquire about lifestyle photography pricing.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
                            >
                                Get Quote
                            </a>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                            <div>
                                <h3 className="mb-2 text-xl font-bold">Commercial Photography</h3>
                                <p className="text-zinc-400">Product shoots, brand campaigns</p>
                            </div>
                            <a
                                href={generateWhatsAppLink('photography', "Hi! I'd like to inquire about commercial photography pricing.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
                            >
                                Get Quote
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials testimonials={testimonials} accentColor="amber" />

            {/* Process Timeline */}
            <ProcessTimeline steps={processSteps} accentColor="amber" />

            {/* FAQ */}
            <ServiceFAQ faqs={faqs} accentColor="amber" />

            <BookingFlyout service="photography" />
            <Footer />
        </main>
    );
}
