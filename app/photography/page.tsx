import type { Metadata } from 'next';
import { BookingFlyout } from '@/components/booking/BookingFlyout';
import { Footer } from '@/components/shared/Footer';
import { Testimonials } from '@/components/sections/Testimonials';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceFAQ } from '@/components/sections/ServiceFAQ';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { getEquipment } from '@/actions/equipment';
import { Camera, Clock, MapPin, Video, Monitor } from 'lucide-react';
import { PortfolioCategories } from '@/components/sections/PortfolioCategories';
import ServiceTerms from '@/components/sections/ServiceTerms';

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
        title: 'Post Production',
        description: 'Our team of editors meticulously selects and enhances the best images from your shoot. We focus on natural color correction, subtle retouching, and preserving the authentic mood of the moment.',
    },
    {
        number: '5',
        title: 'Delivery',
        description: 'Within 7-10 days, receive professionally edited high-resolution images via cloud link. Unlimited revisions included.',
    }
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

export default async function PhotographyPage() {
    // Fetch live equipment summary
    const equipment = await getEquipment();
    
    // Group up to 3 names per category for the preview text
    const getTopItems = (catMatch: string) => {
        const matches = equipment.filter(e => {
            const catName = (e.categories as any)?.name?.toLowerCase() || '';
            return catName.includes(catMatch);
        });
        return matches.slice(0, 3).map(e => e.name).join(', ') || `Various premium ${catMatch}s`;
    };

    const previewCameras = getTopItems('camera');
    const previewLenses = getTopItems('lens');
    const previewLighting = getTopItems('light');

    return (
        <main className="min-h-screen bg-background pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 py-24">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-500">
                            <Camera className="h-4 w-4" />
                            Photography Services
                        </div>
                        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                            Photography &
                            <br />
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                Cinematography
                            </span>
                        </h1>
                        <p className="mb-8 text-xl text-muted-foreground">
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
            <section className="border-t border-border py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Our Approach</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-muted/50 p-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <Camera className="h-6 w-6 text-amber-500" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold">Authentic Storytelling</h3>
                            <p className="text-muted-foreground">
                                We capture genuine emotions and candid moments that tell your unique story.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/50 p-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <Clock className="h-6 w-6 text-amber-500" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold">Professional Delivery</h3>
                            <p className="text-muted-foreground">
                                High-quality edited images delivered within 7-10 days of your session.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/50 p-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <MapPin className="h-6 w-6 text-amber-500" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold">On-Location Flexibility</h3>
                            <p className="text-muted-foreground">
                                We travel to your venue or suggest stunning locations across India.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="border-t border-border py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-12 text-center text-4xl font-bold">Portfolio</h2>
                    <PortfolioCategories />
                </div>
            </section>

            {/* Services */}
            <section className="border-t border-border bg-muted/30 py-24">
                <div className="container mx-auto px-6">
                    <h2 className="mb-4 text-center text-4xl font-bold">Our Services</h2>
                    <p className="mb-16 text-center text-muted-foreground">Choose the session that fits your story</p>

                    {/* ── Photography ──────────────────────────────────────── */}
                    <div className="mb-16">
                        {/* Events */}
                        <div className="mb-10">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-semibold text-amber-500">
                                    Events
                                </span>
                                <div className="h-px flex-1 bg-secondary" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    { title: 'Wedding', desc: 'Full-day coverage with dual-shooter kits & premium editing' },
                                    { title: 'Engagements', desc: 'Intimate pre-wedding & engagement sessions' },
                                    { title: 'Birthdays', desc: 'Birthday milestones, parties & celebrations' },
                                ].map((s) => (
                                    <div key={s.title} className="flex flex-col justify-between rounded-xl border border-border bg-muted/50 p-6">
                                        <div>
                                            <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                                            <p className="text-sm text-muted-foreground">{s.desc}</p>
                                        </div>
                                        <a
                                            href={generateWhatsAppLink('photography', `Hi! I'd like to inquire about ${s.title} photography.`)}
                                            target="_blank"
                                            rel="noopener noreferrer"
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
                                    { title: 'Family', desc: 'Studio & outdoor family portrait sessions' },
                                    { title: 'Maternity', desc: 'Elegant maternity & expecting mother shoots' },
                                    { title: 'Baby Shoots', desc: 'Safe, gentle newborn & baby photography' },
                                ].map((s) => (
                                    <div key={s.title} className="flex flex-col justify-between rounded-xl border border-border bg-muted/50 p-6">
                                        <div>
                                            <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                                            <p className="text-sm text-muted-foreground">{s.desc}</p>
                                        </div>
                                        <a
                                            href={generateWhatsAppLink('photography', `Hi! I'd like to inquire about ${s.title} photography.`)}
                                            target="_blank"
                                            rel="noopener noreferrer"
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
                                { title: 'Product', desc: 'E-commerce & catalogue product photography' },
                                { title: 'Cinematic Videos', desc: 'Brand films & corporate video production' },
                                { title: 'Social Media Content', desc: 'Platform-ready reels, posts & campaigns' },
                                { title: 'Model Shoots', desc: 'Fashion & model portfolio sessions' },
                                { title: 'Headshot Photography', desc: 'Professional headshots for teams & founders' },
                            ].map((s) => (
                                <div key={s.title} className="flex flex-col justify-between rounded-xl border border-border bg-muted/50 p-6">
                                    <div>
                                        <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                                    </div>
                                    <a
                                        href={generateWhatsAppLink('photography', `Hi! I'd like to inquire about ${s.title}.`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
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
                                { title: 'Ads', desc: 'High-concept advertisement productions' },
                                { title: 'Music Videos', desc: 'Full-production music videos with cinema kit' },
                                { title: 'Short Films', desc: 'Narrative short film production & post' },
                            ].map((s) => (
                                <div key={s.title} className="flex flex-col justify-between rounded-xl border border-border bg-muted/50 p-6">
                                    <div>
                                        <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                                    </div>
                                    <a
                                        href={generateWhatsAppLink('photography', `Hi! I'd like to inquire about ${s.title}.`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
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
                        <p className="mb-12 text-muted-foreground">We use industry-standard gear to ensure the highest quality results.</p>
                        
                        <div className="grid gap-6 sm:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-background p-8 text-center">
                                <Monitor className="mx-auto mb-4 h-8 w-8 text-amber-500" />
                                <h3 className="mb-2 font-bold text-lg">Cameras</h3>
                                <p className="text-sm text-muted-foreground">{previewCameras}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-8 text-center">
                                <Camera className="mx-auto mb-4 h-8 w-8 text-amber-500" />
                                <h3 className="mb-2 font-bold text-lg">Lenses</h3>
                                <p className="text-sm text-muted-foreground">{previewLenses}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-8 text-center">
                                <Video className="mx-auto mb-4 h-8 w-8 text-amber-500" />
                                <h3 className="mb-2 font-bold text-lg">Lighting &amp; Grip</h3>
                                <p className="text-sm text-muted-foreground">{previewLighting}</p>
                            </div>
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
            <ServiceTerms type="photography" />
            <BookingFlyout service="photography" />
            <Footer />
        </main>
    );
}
