'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const BACKDROPS = [
  {
    id: 1,
    name: 'Matte Black',
    image: '/backdrops_images/easternblue.webp',
  },
  { id: 2, name: 'Pastel Red', image: '/backdrops_images/pastel-red.webp' },
  {
    id: 3,
    name: 'Golden Yellow',
    image: '/backdrops_images/golden-yellow.webp',
  },
  { id: 4, name: 'Asagi Blue', image: '/backdrops_images/asagi-blue.webp' },
  { id: 5, name: 'Muddy Green', image: '/backdrops_images/muddy-green.webp' },
  { id: 6, name: 'Dark Grey', image: '/backdrops_images/dark-grey.webp' },
  { id: 7, name: 'White', image: '/backdrops_images/white.webp' },
  {
    id: 8,
    name: 'Sandy Walnut',
    image: '/backdrops_images/sandy-walnut.webp',
  },
  {
    id: 9,
    name: 'Pale Lavender',
    image: '/backdrops_images/pale-lavender.webp',
  },
];

export function BackdropsGallery() {
  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Studio Backdrops</h2>
          <p className="text-muted-foreground">
            9 professional backdrops available for every mood
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
          {BACKDROPS.map((backdrop, index) => (
            <motion.div
              key={backdrop.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: 'easeOut',
              }}
              className="group relative overflow-hidden rounded-lg border border-white/5 bg-zinc-900/50 w-64 h-44 mx-auto"
            >
              {backdrop.image ? (
                <Image
                  src={backdrop.image}
                  alt={backdrop.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105" />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {backdrop.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
