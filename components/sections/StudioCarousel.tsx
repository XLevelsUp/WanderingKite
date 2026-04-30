'use client';

import React, { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CAROUSEL_IMAGES = [
  { id: 1, src: '/images/studio/placeholder-1.jpg', alt: 'Studio Full View' },
  { id: 2, src: '/images/studio/placeholder-2.jpg', alt: 'Cyclorama Wall' },
  { id: 3, src: '/images/studio/placeholder-3.jpg', alt: 'Lighting Setup' },
  { id: 4, src: '/images/studio/placeholder-4.jpg', alt: 'Makeup & Changing Area' },
  { id: 5, src: '/images/studio/placeholder-5.jpg', alt: 'Equipment Room' },
];

export function StudioCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-12 relative overflow-hidden bg-zinc-950">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex cursor-grab active:cursor-grabbing">
          {CAROUSEL_IMAGES.map((img, index) => {
            const isActive = index === selectedIndex;
            return (
              <div
                key={img.id}
                className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] min-w-0 transition-all duration-700 ease-out"
                style={{
                  opacity: isActive ? 1 : 0.5,
                  filter: isActive ? 'blur(0px)' : 'blur(8px)',
                }}
              >
                <div className="relative aspect-[16/9] overflow-hidden border-x border-white/5 bg-zinc-900 shadow-2xl">
                  {/* Glowing Outline for Active Slide */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 z-20 border-y border-amber-500/50 shadow-[inset_0_0_50px_rgba(245,158,11,0.2)] pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  
                  {/* Abstract placeholder mimicking an image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className={`font-medium uppercase tracking-widest text-sm sm:text-base transition-colors duration-500 ${isActive ? 'text-amber-500' : 'text-zinc-600'}`}>
                      {img.alt}
                    </p>
                  </div>
                  {/* Optional: Add actual image once uploaded to public folder */}
                  {/* <Image src={img.src} alt={img.alt} fill className="object-cover opacity-80" /> */}
                  
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-12 pointer-events-none flex items-center justify-between z-30">
        <button 
            onClick={scrollPrev}
            className="pointer-events-auto h-12 w-12 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-zinc-800 transition-all backdrop-blur-md shadow-xl"
            aria-label="Previous Slide"
        >
            <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
            onClick={scrollNext}
            className="pointer-events-auto h-12 w-12 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-zinc-800 transition-all backdrop-blur-md shadow-xl"
            aria-label="Next Slide"
        >
            <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
