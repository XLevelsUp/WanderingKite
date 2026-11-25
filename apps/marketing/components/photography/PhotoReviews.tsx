'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Review {
  name: string;
  role: string;
  content: string;
  rating: number;
  service?: string;
}

/**
 * Photography reviews (light, sand tone). lg: score + controls left, a 2-up drag carousel right with a progress hairline.
 * Phones: heading, carousel, then controls. Cards share the row height; long reviews clamp and expand in place.
 */
export function PhotoReviews({ reviews, wrap, sourceUrl }: { reviews: Review[]; wrap: string; sourceUrl?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);

  const sync = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setProgress(Math.max(0, Math.min(1, emblaApi.scrollProgress())));
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    sync();
    emblaApi.on('select', sync).on('reInit', sync).on('scroll', sync);
    return () => {
      emblaApi.off('select', sync).off('reInit', sync).off('scroll', sync);
    };
  }, [emblaApi, sync]);

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length, 1);

  const controls = (
    <div className="flex items-center gap-4">
      <div className="relative h-px flex-1 bg-primary/15 lg:w-40 lg:flex-none">
        <span className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-[#CBB9A4] via-primary to-primary-deep transition-transform duration-300" style={{ transform: `scaleX(${Math.max(progress, 0.08)})` }} />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canPrev}
          aria-label="Previous testimonial"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/30 text-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canNext}
          aria-label="Next testimonial"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cta text-cta-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <section aria-labelledby="reviews-heading" data-tone="sand">
      <div className={`${wrap} grid gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:py-24`}>
        <div data-reveal className="flex flex-col lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Reviews</p>
          <h2 id="reviews-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What Our Clients Say</h2>
          <p className="mt-4 text-base text-foreground/80">Real feedback from creators, brands, and clients who have worked with us.</p>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-foreground underline decoration-accent-text decoration-2 underline-offset-4 hover:text-accent-text"
            >
              Read all reviews on Google
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          )}
          {/* Score derived from the reviews shown, not a separate claim. */}
          <div className="mt-8 flex items-end gap-4">
            <span className="text-5xl font-bold tabular-nums tracking-tight text-foreground">{avg.toFixed(1)}</span>
            <div className="pb-1">
              <div className="flex gap-0.5">
                <span className="sr-only">Average rating: {avg.toFixed(1)} out of 5 stars</span>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} aria-hidden="true" className={`h-4 w-4 ${i < Math.round(avg) ? 'fill-primary-deep text-primary-deep' : 'text-foreground/25'}`} />
                ))}
              </div>
              <p className="mt-1 text-sm text-foreground/70">{reviews.length} reviews</p>
            </div>
          </div>
          <div className="mt-auto hidden pt-12 lg:block">{controls}</div>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <div className="-mx-5 overflow-hidden px-5 sm:mx-0 sm:px-0" ref={emblaRef}>
            <ul className="-ml-4 flex cursor-grab items-stretch active:cursor-grabbing">
              {reviews.map((r, i) => (
                <li
                  key={i}
                  data-reveal
                  style={{ '--d': `${Math.min(i, 3) * 120}ms` } as CSSProperties}
                  className="flex min-w-0 flex-[0_0_88%] pl-4 sm:flex-[0_0_50%] 3xl:flex-[0_0_33.333%]"
                >
                  <ReviewCard review={r} />
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 lg:hidden">{controls}</div>
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
    <figure className="flex w-full select-none flex-col rounded-2xl bg-card p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-shadow duration-500 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="flex items-center justify-between">
        <span aria-hidden="true" className="font-serif text-6xl leading-none text-primary/40">&ldquo;</span>
        <div className="flex gap-0.5">
          <span className="sr-only">{review.rating} out of 5 stars</span>
          {[...Array(5)].map((_, i) => (
            <Star key={i} aria-hidden="true" className={`h-4 w-4 ${i < review.rating ? 'fill-primary-deep text-primary-deep' : 'text-foreground/25'}`} />
          ))}
        </div>
      </div>

      <blockquote className="mt-2 flex-1">
        <p ref={ref} className={`whitespace-pre-line text-base leading-relaxed text-foreground/85 ${expanded ? '' : 'line-clamp-5'}`}>{review.content}</p>
        {(overflows || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-2 text-sm font-semibold text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-4 border-t border-border pt-6">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#CBB9A4] via-primary to-primary-deep text-sm font-bold text-white shadow-[0_8px_20px_-10px_hsl(var(--primary-deep)/0.8)]">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{review.name}</p>
          <p className="truncate text-sm text-foreground/70">
            {review.role}
            {review.service && <span className="text-accent-text"> · {review.service}</span>}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
