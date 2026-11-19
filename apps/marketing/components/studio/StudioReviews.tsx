'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { STUDIO_WRAP } from './wrap';

interface Review {
  name: string;
  role: string;
  content: string;
  rating: number;
  service?: string;
}

/** Compact studio reviews: content-height cards (4-line clamp, expand in place) in a snap carousel; aligned to the studio container. */
export function StudioReviews({ reviews }: { reviews: Review[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: false, containScroll: 'trimSnaps' });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    sync();
    emblaApi.on('select', sync);
    emblaApi.on('reInit', sync);
  }, [emblaApi, sync]);

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length, 1);

  return (
    <section aria-labelledby="reviews-heading" className="border-t border-border">
      <div className={`${STUDIO_WRAP} py-16 sm:py-20`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="reviews-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What Our Clients Say
            </h2>
            <p className="mt-4 max-w-2xl text-base text-foreground/70">
              Real feedback from creators, brands, and clients who have worked with us.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Score derived from the reviews shown, not a separate claim. */}
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
              <span className="font-semibold tabular-nums text-foreground">{avg.toFixed(1)}</span>
              <span className="text-foreground/70">· {reviews.length}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-primary-deep to-primary text-primary-foreground transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden lg:mt-12" ref={emblaRef}>
          {/* items-stretch + h-full cards: every card matches the row height, author line pinned to the bottom. */}
          <ul className="-ml-4 flex items-stretch">
            {reviews.map((r, i) => (
              <li key={i} className="flex min-w-0 flex-[0_0_88%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] 2xl:flex-[0_0_25%]">
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const check = () => {
      const el = ref.current;
      if (el && !expanded) setOverflows(el.scrollHeight > el.clientHeight + 2);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [review.content, expanded]);

  return (
    <figure className="flex w-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/40">
      <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} aria-hidden className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-border'}`} />
        ))}
      </div>

      {/* flex-1 absorbs the spare height so every card ends at the same line; long reviews clamp to 4 lines and expand in place. */}
      <blockquote className="mt-4 flex-1">
        <p ref={ref} className={`whitespace-pre-line text-sm leading-relaxed text-foreground/85 ${expanded ? '' : 'line-clamp-4'}`}>
          &quot;{review.content}&quot;
        </p>
        {(overflows || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-2 text-xs font-semibold text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-4 border-t border-border pt-4">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-deep to-primary text-sm font-bold text-primary-foreground">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{review.name}</p>
          <p className="truncate text-xs text-foreground/70">
            {review.role}
            {review.service && <span className="text-accent-text"> · {review.service}</span>}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
