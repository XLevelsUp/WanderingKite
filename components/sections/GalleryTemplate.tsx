'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowLeft, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Link from 'next/link';

import { generateWhatsAppLink } from '@/lib/whatsapp';

import { Database } from '@/lib/database.types';
import Image from 'next/image';

type ShootWithImages = Database['public']['Tables']['shoots']['Row'] & {
  gallery_images?: Database['public']['Tables']['gallery_images']['Row'][];
};

interface GalleryTemplateProps {
    mainCategory?: string;
    subCategory?: string;
    category: {
        id: string;
        title: string;
        category: string;
        focus: string;
    };
    shoots?: ShootWithImages[];
}

export function GalleryTemplate({ category, mainCategory, subCategory, shoots = [] }: GalleryTemplateProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Extract all images from all shoots into a single flat array
    const allImages = shoots.flatMap(shoot => shoot.gallery_images || []);
    
    const heroImage = allImages.length > 0 ? allImages[0].url : null;

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
                    {heroImage ? (
                        <Image 
                            src={heroImage} 
                            alt={category.title} 
                            fill 
                            className="object-cover" 
                        />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                            <div className="flex h-full items-center justify-center">
                                <Camera className="h-24 w-24 text-zinc-700" />
                            </div>
                        </>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                            <span className="mb-4 inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1 text-sm font-semibold text-amber-500 backdrop-blur-sm">
                                {category.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold text-foreground">{category.title}</h1>
                            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
                                Premium {category.title.toLowerCase()} tailored for {category.focus.toLowerCase()}.
                                {!heroImage && " Images will be uploaded later."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* True Masonry Grid */}
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                    {allImages.length > 0 ? allImages.map((img, index) => {
                        return (
                        <motion.div
                            key={img.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -5 }}
                            onClick={() => {
                                setSelectedImage(img.url);
                                setZoomLevel(1);
                            }}
                            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 shadow-2xl backdrop-blur-sm break-inside-avoid cursor-pointer"
                        >
                            <img 
                                src={img.url} 
                                alt={img.alt_text || 'Gallery Image'} 
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        </motion.div>
                    )}) : (
                        <div className="col-span-full text-center py-24 text-muted-foreground bg-white/5 rounded-2xl border border-white/10 border-dashed">
                            No images have been uploaded to this category yet. Check back soon!
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
                        onClick={() => {
                            setSelectedImage(null);
                            setZoomLevel(1);
                        }}
                    >
                        <div className="absolute top-6 left-6 z-50 flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomLevel(z => Math.min(z + 0.5, 4));
                                }}
                                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn className="h-6 w-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomLevel(z => Math.max(z - 0.5, 1));
                                }}
                                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut className="h-6 w-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomLevel(1);
                                }}
                                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                                title="Reset Zoom"
                            >
                                <RotateCcw className="h-6 w-6" />
                            </button>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                                setZoomLevel(1);
                            }}
                            className="absolute top-6 right-6 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                            title="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <motion.img
                            drag={zoomLevel > 1}
                            dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: zoomLevel, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            src={selectedImage}
                            alt="Expanded View"
                            className={`max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl ${zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                setZoomLevel(z => z > 1 ? 1 : 2);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
