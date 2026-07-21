'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { FadeIn } from '@/components/animations/FadeIn';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  service?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  accentColor?: 'amber' | 'blue' | 'purple' | 'green';
}

const accentColors = {
  amber: 'text-amber-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  green: 'text-green-500',
};

const fillAccentColors = {
  amber: 'fill-amber-500',
  blue: 'fill-blue-500',
  purple: 'fill-purple-500',
  green: 'fill-green-500',
};

const bgAccentColors = {
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
};

export function Testimonials({
  testimonials,
  accentColor = 'amber',
}: TestimonialsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', loop: true, duration: 40 },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="border-t border-border bg-muted/20 py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="mb-4 text-4xl font-bold tracking-tight">What Our Clients Say</h2>
              <p className="max-w-2xl text-muted-foreground text-lg">
                Real feedback from creators, brands, and clients who have worked with us.
              </p>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-3 shrink-0">
              <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-muted disabled:opacity-50 shadow-sm"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-muted disabled:opacity-50 shadow-sm"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-6">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index} 
                    className="pl-6 min-w-0 flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                  >
                    <div className="flex flex-col h-full rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-xl hover:border-zinc-700/50">
                      <Quote
                        className={`mb-6 h-10 w-10 ${accentColors[accentColor]} opacity-20`}
                      />

                      {/* Rating */}
                      <div className="mb-6 flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? `${fillAccentColors[accentColor]} ${accentColors[accentColor]}`
                                : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Content */}
                      <p className="mb-8 text-muted-foreground leading-relaxed text-sm md:text-base flex-1">
                        "{testimonial.content}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-4 mt-auto border-t border-border/50 pt-6">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgAccentColors[accentColor]} text-white font-bold text-lg`}>
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                          {testimonial.service && (
                            <p className={`mt-0.5 text-xs font-semibold ${accentColors[accentColor]}`}>
                              {testimonial.service}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
