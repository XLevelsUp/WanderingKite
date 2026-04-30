'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

const portfolioCategories = [
    { id: 'events', title: 'Event Photography', category: 'Events', focus: 'Weddings, Engagements & Birthdays' },
    { id: 'portraits', title: 'Portrait Sessions', category: 'Portraits', focus: 'Family, Maternity & Baby Shoots' },
    { id: 'corporate', title: 'Corporate & Brand', category: 'Corporate', focus: 'Products, Headshots & Content' },
    { id: 'commercial', title: 'Commercial Productions', category: 'Commercial', focus: 'Ads, Music Videos & Short Films' },
];

export function PortfolioCategories() {
    const getBentoClasses = (index: number) => {
        // Create an asymmetric bento grid layout on medium/large screens
        if (index === 0) return 'md:col-span-2 md:row-span-1';
        if (index === 1) return 'md:col-span-1 md:row-span-1';
        if (index === 2) return 'md:col-span-1 md:row-span-1';
        if (index === 3) return 'md:col-span-2 md:row-span-1';
        return '';
    };

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 auto-rows-[300px]">
            {portfolioCategories.map((item, index) => (
                <Link href={`/photography/${item.id}`} key={item.id} className={`block ${getBentoClasses(index)}`}>
                    <motion.div
                        layoutId={`gallery-card-${item.id}`}
                        className="group relative h-full w-full overflow-hidden rounded-2xl bg-card border border-border shadow-lg transition-transform duration-500 hover:-translate-y-1"
                    >
                        {/* Abstract background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 transition-transform duration-700 group-hover:scale-105" />
                        
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/0 opacity-0 mix-blend-color-dodge transition-opacity duration-500 group-hover:opacity-100" />
                        
                        <div className="flex h-full items-center justify-center relative z-10">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:border-amber-500/30 group-hover:bg-amber-500/20">
                                    <Camera className="h-8 w-8 text-zinc-400 transition-colors duration-300 group-hover:text-amber-400" />
                                </div>
                                <p className="text-sm font-medium tracking-wide text-zinc-400 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:-translate-y-2">{item.focus}</p>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-6 transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                            <span className="mb-3 inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-md">
                                {item.category}
                            </span>
                            <h3 className="text-2xl font-bold tracking-tight text-white">{item.title}</h3>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}
