"use client";

import React, { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const CAROUSEL_IMAGES = [
  { id: 1, src: "/images/studio/placeholder1.webp", alt: "Studio Full View" },
  { id: 2, src: "/images/studio/placeholder2.webp", alt: "Cyclorama Wall" },
  { id: 3, src: "/images/studio/placeholder3.webp", alt: "Lighting Setup" },
  {
    id: 4,
    src: "/images/studio/placeholder4.webp",
    alt: "Makeup & Changing Area",
  },
  { id: 5, src: "/images/studio/placeholder5.webp", alt: "Equipment Room" },
];

export function StudioCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      containScroll: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 relative overflow-hidden bg-zinc-950">
      <div className="embla !overflow-visible" ref={emblaRef}>
        <div className="embla__container flex">
          {CAROUSEL_IMAGES.map((img, index) => {
            const isActive = index === selectedIndex;

            return (
              <div
                key={img.id}
                className="embla__slide flex-[0_0_80%] sm:flex-[0_0_50%] min-w-0"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.92,
                    opacity: isActive ? 1 : 0.3,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-zinc-900 shadow-2xl transition-all duration-500"
                >
                  {/* Glowing Border Animation for Active Slide */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 border-2 border-warning/60 pointer-events-none shadow-[inset_0_0_40px_rgba(var(--warning-rgb),0.2)]"
                        style={{
                          boxShadow:
                            "inset 0 0 30px rgba(234, 179, 8, 0.2), 0 0 20px rgba(234, 179, 8, 0.1)",
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    priority={isActive}
                    className={img.id === 5 ? "object-contain" : "object-cover"}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="max-w-7xl mx-auto mt-12 px-6 flex items-center justify-between">
        {/* Progress Dots */}
        <div className="flex gap-2.5">
          {CAROUSEL_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1 transition-all duration-500 rounded-full ${
                i === selectedIndex ? "w-12 bg-warning" : "w-3 bg-zinc-800"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex gap-4">
          <button
            onClick={scrollPrev}
            className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-warning hover:text-black hover:border-warning transition-all duration-300"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-warning hover:text-black hover:border-warning transition-all duration-300"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
