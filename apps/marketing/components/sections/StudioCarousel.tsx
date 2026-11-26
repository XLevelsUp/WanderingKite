'use client';

import React, { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CAROUSEL_IMAGES = [
  { id: 1, src: '/images/studio/studio-floor-infinity-wall.webp', alt: 'Photography studio rental in Coimbatore - 1200 sq ft space' },
  { id: 2, src: '/images/studio/studio-cyclorama-wall.webp', alt: 'Studio with cyclorama wall Coimbatore for video shoot' },
  { id: 3, src: '/images/studio/studio-godox-lighting.webp', alt: 'Studio with Godox lighting Coimbatore setup' },
  {
    id: 4,
    src: '/images/studio/studio-makeup-room.webp',
    alt: 'Studio space for rent Coimbatore with dedicated makeup room',
  },
  { id: 5, src: '/images/studio/studio-equipment-setup.webp', alt: 'Studio rental with equipment included Coimbatore' },
];

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Responsive sources for the static studio photos. Image optimisation is off site-wide (next.config), so next/image
 * would send the full 1600px file to every phone; instead each photo has pre-made 640/960px copies (made with sharp,
 * next to the original as name-w640.webp / name-w960.webp) and the browser picks via srcSet + sizes.
 */
const VARIANTS: Record<string, { w: number[]; full: number }> = {
  'studio-floor-infinity-wall': { w: [640, 960], full: 1600 },
  'studio-cyclorama-wall': { w: [640], full: 800 },
  'studio-godox-lighting': { w: [640, 960], full: 1600 },
  'studio-makeup-room': { w: [640, 960], full: 1600 },
  'studio-equipment-setup': { w: [640, 960], full: 1600 },
};
const srcSetFor = (src: string) => {
  const base = src.replace(/\.webp$/, '');
  const v = VARIANTS[base.split('/').pop() ?? ''];
  if (!v) return undefined;
  return [...v.w.map((w) => `${base}-w${w}.webp ${w}w`), `${src} ${v.full}w`].join(', ');
};

/** Opening hero of the studio page: large centred slides with peeking neighbours; theme colours only. */
export function StudioCarousel({ first = true }: { first?: boolean }) {
  const reduce = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', skipSnaps: false, containScroll: false },
    reduce ? [] : [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    // First on the page: 80px header + 32/48/64px. Otherwise no padding: the hero copy above and the next section below already supply the 64/80/96 gaps.
    <section aria-label="Studio photos" className={`relative overflow-hidden bg-background ${first ? 'pt-28 sm:pt-32 lg:pt-36' : ''}`}>
      <div className="embla !overflow-visible" ref={emblaRef}>
        <div className="embla__container flex">
          {CAROUSEL_IMAGES.map((img, index) => {
            const isActive = index === selectedIndex;
            return (
              <div
                key={img.id}
                // Slide width: 88% phone, 72% tablet; desktop+ capped by screen height so a slide never outgrows the viewport.
                className="embla__slide min-w-0 flex-[0_0_88%] px-2 sm:px-3 md:flex-[0_0_72%] lg:flex-[0_0_min(64%,calc(64svh*1.7778))]"
              >
                <motion.div
                  animate={{ scale: isActive ? 1 : 0.94, opacity: isActive ? 1 : 0.4 }}
                  transition={{ duration: reduce ? 0 : 0.8, ease: [0.32, 0.72, 0, 1] }}
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-card sm:aspect-[16/9] ${isActive ? 'ring-1 ring-primary/40' : ''}`}
                >
                  {/* Plain <img> with srcSet so phones get the 640/960px copy (see VARIANTS). Slide 0 is the page's LCP image on /studiospace, so it always loads eagerly at high priority. */}
                  <img
                    src={img.src}
                    srcSet={srcSetFor(img.src)}
                    sizes="(min-width: 1024px) 64vw, (min-width: 768px) 72vw, 88vw"
                    alt={img.alt}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                    className={`absolute inset-0 h-full w-full ${img.id === 5 ? 'object-contain' : 'object-cover'}`}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls: counter + progress bars left, arrows right — same width steps as the page. */}
      <div className="mx-auto mt-6 flex w-full max-w-7xl items-center justify-between gap-4 px-5 sm:mt-8 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        <div className="flex items-center gap-4">
          <p className="text-[11px] font-semibold tabular-nums tracking-[0.24em] text-foreground" aria-live="polite">
            {pad2(selectedIndex + 1)} <span className="text-foreground/50">/ {pad2(CAROUSEL_IMAGES.length)}</span>
          </p>
          <div className="hidden items-center sm:flex" role="tablist" aria-label="Carousel slides">
            {CAROUSEL_IMAGES.map((img, i) => (
              <button
                key={i}
                role="tab"
                onClick={() => emblaApi?.scrollTo(i)}
                className="flex h-11 w-8 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Go to slide ${i + 1}: ${img.alt}`}
                aria-selected={i === selectedIndex}
                aria-current={i === selectedIndex ? 'true' : undefined}
              >
                <span className={`h-1 rounded-full transition-all duration-500 ${i === selectedIndex ? 'w-6 bg-primary' : 'w-2 bg-foreground/20'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={scrollPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
