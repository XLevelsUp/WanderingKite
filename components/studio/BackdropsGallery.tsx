'use client';

import React from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKDROPS = [
  { id: 1, name: 'Pure White',    color: '#F5F5F5', image: null },
  { id: 2, name: 'Matte Black',   color: '#1A1A1A', image: null },
  { id: 3, name: 'Warm Grey',     color: '#9E9E9E', image: null },
  { id: 4, name: 'Deep Navy',     color: '#1B2A4A', image: null },
  { id: 5, name: 'Forest Green',  color: '#2D4A3E', image: null },
  { id: 6, name: 'Blush Pink',    color: '#F4A8B0', image: null },
  { id: 7, name: 'Concrete Grey', color: '#6E6E6E', image: null },
  { id: 8, name: 'Vintage Beige', color: '#D4B896', image: null },
  { id: 9, name: 'Chalkboard',    color: '#2C3E2D', image: null },
];

export function BackdropsGallery() {
  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Studio Backdrops</h2>
          <p className="text-muted-foreground">9 professional backdrops available for every mood</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {BACKDROPS.map((backdrop, index) => (
            <motion.div
              key={backdrop.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50 aspect-square"
            >
              {backdrop.image ? (
                <Image
                  src={backdrop.image}
                  alt={backdrop.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundColor: backdrop.color }}
                >
                  <Camera 
                    className="w-12 h-12 opacity-30" 
                    style={{ 
                      color: ['#F5F5F5', '#F4A8B0', '#D4B896'].includes(backdrop.color) ? '#000' : '#FFF' 
                    }} 
                  />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
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
