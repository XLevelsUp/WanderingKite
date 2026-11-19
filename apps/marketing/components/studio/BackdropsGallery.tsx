'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const BACKDROPS = [
  {
    id: 1,
    name: 'Black',
    image: '/backdrops_images/easternblue.webp',
  },
  { id: 2, name: 'Ruby Red', image: '/backdrops_images/pastel-red.webp' },
  {
    id: 3,
    name: 'Daffodil',
    image: '/backdrops_images/golden-yellow.webp',
  },
  // Teal's photo has a ~15% band at the top (black, white strip, rolled edge) and ~3% at the bottom: 1.3× from 80% down crops ~18.5% top, ~4.6% bottom.
  { id: 4, name: 'Teal Blue', image: '/backdrops_images/asagi-blue.webp', zoom: 'origin-[50%_80%] scale-[1.3] group-hover:scale-[1.36]' },
  { id: 5, name: 'Olive Green', image: '/backdrops_images/muddy-green.webp' },
  { id: 6, name: 'Neutral Green', image: '/backdrops_images/dark-grey.webp' },
  { id: 7, name: 'Pure White', image: '/backdrops_images/white.webp' },
  {
    id: 8,
    name: 'Dark Brown',
    image: '/backdrops_images/sandy-walnut.webp',
  },
  {
    id: 9,
    name: 'Lavender',
    image: '/backdrops_images/pale-lavender.webp',
  },
];

/** Backdrop swatches: portrait tiles with the name always visible (hover isn't available on touch). */
export function BackdropsGallery() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="backdrops-heading" className="border-t border-border">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="backdrops-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Studio Backdrops</h2>
          <p className="text-base text-muted-foreground">9 professional backdrops available for every mood</p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:mt-16 lg:grid-cols-5 lg:gap-6 xl:grid-cols-9">
          {BACKDROPS.map((backdrop, index) => (
            <motion.li
              key={backdrop.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: reduce ? 0 : index * 0.05, duration: 0.5, ease: 'easeOut' }}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-card">
                <Image
                  src={backdrop.image}
                  alt={`Studio backdrop: ${backdrop.name} background for photography studio rental in RS Puram Coimbatore`}
                  fill
                  sizes="(min-width: 1280px) 11vw, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  // The source photos carry ~3% dark/white bands at top and bottom; a 12% zoom crops them so each swatch fills its frame.
                  className={`object-cover transition-transform duration-500 motion-reduce:transition-none ${'zoom' in backdrop && backdrop.zoom ? backdrop.zoom : 'scale-[1.12] group-hover:scale-[1.18]'}`}
                />
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {backdrop.name}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
