'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

const portfolioCategories = [
  {
    id: 'events',
    title: 'Event Photography',
    category: 'Events',
    focus: 'Weddings, Engagements & Birthdays',
  },
  {
    id: 'portraits',
    title: 'Portrait Sessions',
    category: 'Portraits',
    focus: 'Family, Maternity & Baby Shoots',
  },
  {
    id: 'corporate',
    title: 'Corporate & Brand',
    category: 'Corporate',
    focus: 'Products, Headshots & Content',
  },
  {
    id: 'commercial',
    title: 'Commercial Productions',
    category: 'Commercial',
    focus: 'Ads, Music Videos & Short Films',
  },
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
        <Link
          href={`/photography/${item.id}`}
          key={item.id}
          className={`block ${getBentoClasses(index)}`}
        >
          <motion.div
            layoutId={`gallery-card-${item.id}`}
            className="group relative h-full w-full overflow-hidden rounded-2xl bg-card border border-border shadow-lg transition-transform duration-500 hover:-translate-y-1"
          >
            <Image
              src={`/images/photography/${item.id}.webp`}
              alt={
                item.id === 'events'
                  ? 'Best wedding photography in Coimbatore - Wandering Kite'
                  : item.id === 'portraits'
                  ? 'Portrait photographer and maternity shoot in RS Puram Coimbatore'
                  : item.id === 'corporate'
                  ? 'Product photography and corporate headshots in Coimbatore'
                  : item.id === 'commercial'
                  ? 'Commercial photographer and music video production in Tamil Nadu'
                  : 'Professional photographer in Coimbatore'
              }
              fill
              priority={index < 2}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
                item.id === 'commercial' ? 'object-top' : 'object-center'
              }`}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/0 opacity-0 mix-blend-color-dodge transition-opacity duration-500 group-hover:opacity-100" />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-6 transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
              <span className="mb-3 inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-md">
                {item.category}
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {item.title}
              </h3>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
