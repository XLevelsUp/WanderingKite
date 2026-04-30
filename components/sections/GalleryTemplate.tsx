'use client';

import { motion } from 'framer-motion';
import { Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { generateWhatsAppLink } from '@/lib/whatsapp';

interface GalleryTemplateProps {
    mainCategory?: string;
    subCategory?: string;
    category: {
        id: string;
        title: string;
        category: string;
        focus: string;
    };
}

export function GalleryTemplate({ category, mainCategory, subCategory }: GalleryTemplateProps) {
    // We create a masonry-like grid of 6 placeholder images
    const placeholderItems = [
        { id: 1, span: "col-span-1 row-span-2" },
        { id: 2, span: "col-span-1 row-span-1" },
        { id: 3, span: "col-span-1 row-span-1" },
        { id: 4, span: "col-span-2 row-span-2" },
        { id: 5, span: "col-span-1 row-span-1" },
        { id: 6, span: "col-span-1 row-span-1" },
    ];

    const backUrl = mainCategory ? `/photography/${mainCategory}` : `/photography`;
    const backText = mainCategory ? `Back to ${category.category}` : `Back to Portfolio`;
    const message = `Hi! I'd like to inquire about your ${category.title} services.`;

    return (
        <main className="min-h-screen bg-background pt-20">
            {/* Sticky Glassmorphism Header */}
            <header className="sticky top-20 z-40 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href={backUrl} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        {backText}
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <h2 className="text-lg font-bold">{category.title}</h2>
                            <p className="text-xs text-muted-foreground">{category.focus}</p>
                        </div>
                        <a
                            href={generateWhatsAppLink('photography', message)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
                        >
                            Book Now
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero / Main Card with LayoutID */}
            <section className="py-12 container mx-auto px-6">
                <motion.div
                    layoutId={`gallery-card-${category.id}`}
                    className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card mb-12"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                    <div className="flex h-full items-center justify-center">
                        <Camera className="h-24 w-24 text-zinc-700" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                            <span className="mb-4 inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1 text-sm font-semibold text-amber-500 backdrop-blur-sm">
                                {category.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold text-foreground">{category.title}</h1>
                            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
                                Premium {category.title.toLowerCase()} tailored for {category.focus.toLowerCase()}.
                                Images will be uploaded later.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Masonry Grid */}
                <div className="grid auto-rows-[300px] grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {placeholderItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -5 }}
                            className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 shadow-2xl backdrop-blur-sm ${item.span}`}
                        >
                            {/* Abstract gradient placeholder simulating an image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 transition-transform duration-700 group-hover:scale-105" />
                            
                            {/* Overlays for depth and hover effects */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-color-dodge" />
                            
                            {/* Icon & Reveal Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-transform duration-500 group-hover:-translate-y-2">
                                <div className="rounded-full bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 shadow-xl">
                                    <Camera className="h-8 w-8 text-zinc-400 group-hover:text-amber-400 transition-colors duration-300" />
                                </div>
                                <div className="mt-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                    <p className="text-sm font-semibold tracking-wide text-white">Image Placeholder {item.id}</p>
                                    <p className="text-xs text-zinc-400 mt-1">Awaiting Upload</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
    );
}
