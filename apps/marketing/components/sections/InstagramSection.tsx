'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { InstagramFeed } from '@/components/shared/InstagramFeed';

const HANDLES = { wanderingkite: 'wanderingkitestudio', studio: 'studiospacecbe' } as const;

const STUDIO_FALLBACK_SLIDES = [
  {
    src: '/images/instagram-fallback/podcast-carousel-01-overview.webp',
    alt: 'Studio Space Coimbatore — One Space, Three Ways to Podcast',
  },
  {
    src: '/images/instagram-fallback/podcast-carousel-02-single-camera.webp',
    alt: '01 Single Camera — Personal Content setup at Studio Space Coimbatore',
  },
  {
    src: '/images/instagram-fallback/podcast-carousel-03-double-camera.webp',
    alt: '02 Double Camera — Split Screen host and guest angles',
  },
  {
    src: '/images/instagram-fallback/podcast-carousel-04-triple-camera.webp',
    alt: '03 Triple Camera — Multi-Angle wide, host close, and guest close shots',
  },
  {
    src: '/images/instagram-fallback/podcast-carousel-05-ready-to-record.webp',
    alt: 'Ready to Record — Contact Studio Space Coimbatore',
  },
] as const;

const PHOTOGRAPHY_FALLBACK_SLIDES = [
  {
    src: '/images/instagram-fallback/bridal-carousel-01-the-bride.webp',
    alt: 'The Bride — A celebration of love and tradition by Wandering Kite Photography',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-02-a-new-journey.webp',
    alt: 'A New Journey — Monochrome bridal portrait editorial',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-03-monochrome-portraits.webp',
    alt: 'Black and white bridal portrait diptych by Wandering Kite',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-04-getting-ready-collage.webp',
    alt: 'Bridal getting ready monochrome collage',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-05-shejal-story.webp',
    alt: 'Shejal — Bridal story editorial in red',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-06-the-regal-grace.webp',
    alt: 'The Regal Grace — Bridal portrait triptych',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-07-every-detail-held-close.webp',
    alt: 'Every detail, held close — Getting ready bridal close-up',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-08-quiet-radiance.webp',
    alt: 'Quiet Radiance — Bridal editorial collage',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-09-grace-portrait.webp',
    alt: 'Grace — Smiling bridal portrait in red attire',
  },
  {
    src: '/images/instagram-fallback/bridal-carousel-10-every-detail-matters.webp',
    alt: 'Because in your dreams, every detail matters — Bridal portrait',
  },
] as const;

/* Feed-down fallback carousel: displays curated account-specific slides in numbered order when the Instagram token is unavailable. */
function InstagramFallback({ handle, account }: { handle: string; account: keyof typeof HANDLES }) {
  const slides = account === 'studio' ? STUDIO_FALLBACK_SLIDES : PHOTOGRAPHY_FALLBACK_SLIDES;
  const aspectClass = account === 'studio' ? 'aspect-square' : 'aspect-[4/5]';
  const reduce = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', containScroll: 'trimSnaps' },
    reduce ? [] : [Autoplay({ delay: 4500, stopOnInteraction: true })]
  );
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <a
          href={`https://instagram.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View @${handle} on Instagram`}
          className="group inline-flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
        >
          <span aria-hidden className="rounded-full bg-gradient-to-tr from-primary-deep to-primary p-0.5 shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-primary">
              <Instagram className="h-4 w-4" />
            </span>
          </span>
          <span className="truncate text-sm font-semibold text-foreground group-hover:text-accent-text transition-colors sm:text-base">
            @{handle}
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </a>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden sm:mt-5" ref={emblaRef}>
        <div className="-ml-3 flex sm:-ml-4">
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className="min-w-0 flex-[0_0_88%] pl-3 sm:flex-[0_0_50%] sm:pl-4"
            >
              <a
                href={`https://instagram.com/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative block ${aspectClass} overflow-hidden rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                {/* srcSet: phones take the 640px copy (name-w640.webp, made with sharp); big/retina screens the 1440px original.
                    Image optimisation is off site-wide, so next/image would always send the 1440px file. */}
                <img
                  src={slide.src.replace(/\.webp$/, '-w640.webp')}
                  srcSet={`${slide.src.replace(/\.webp$/, '-w640.webp')} 640w, ${slide.src} 1440w`}
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 85vw"
                  alt={slide.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="sr-only">Slide {i + 1} of {slides.length}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center" role="tablist" aria-label="Carousel slides">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={selected === i}
              className="flex h-11 w-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  selected === i ? 'w-6 bg-accent-text' : 'w-2 bg-border hover:bg-foreground/40'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs font-medium tabular-nums text-foreground/60">
          {String(selected + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;

/* Compact one-band Instagram section; `account` picks the handle and feed (studio pages use studiospacecbe). */
export function InstagramSection({ account = 'wanderingkite', first = false }: { account?: keyof typeof HANDLES; first?: boolean }) {
  const HANDLE = HANDLES[account];
  const reduce = useReducedMotion();
  const [feedOk, setFeedOk] = useState(true);
  const onUnavailable = useCallback(() => setFeedOk(false), []);
  // When this is the FIRST section on the page (e.g. /studiospace), its text is the page's LCP element: render it
  // visible straight from the HTML. A hide-then-fade-in here kept it invisible until JS hydrated (~3.8s render delay
  // on mobile). Lower on a page, the scroll reveal stays.
  const reveal = (delay = 0) =>
    first
      ? {}
      : {
          initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { ...SETTLE, delay },
        };

  return (
    <section className="relative border-y border-border bg-card" aria-label="Follow us on Instagram">
      {/* Strict spacing (8px grid): py 64/80/96 (top = 80px header + 32/48/64 when first on the page), block gap 48 → 64 at lg. */}
      <div className={`mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16 ${first ? 'pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36' : 'pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24'}`}>
        {/* ── Header ── */}
        {/* Tablet (md–lg): copy left, offer right, so the header spans the same width as the media below. */}
        <motion.div
          {...reveal(0)}
          className="md:grid md:grid-cols-2 md:items-end md:gap-8 lg:col-span-5 lg:block xl:col-span-4"
        >
          <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-text sm:text-xs">
            <Instagram className="h-3.5 w-3.5" aria-hidden />@{HANDLE}
          </p>

          <h2 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
            Behind every great shot
            <span className="block text-accent-text">is a story.</span>
          </h2>

          <p className="mt-4 max-w-md text-base leading-relaxed text-foreground">
            Follow us for exclusive deals, behind-the-scenes moments, and creative inspiration straight from the studio floor.
          </p>
          </div>

          <div className="mt-8 flex w-full max-w-md flex-col gap-4 md:mt-0 md:max-w-none lg:mt-8 lg:max-w-md">
            {/* Offer as one coupon block — label + how to claim together, instead of three loose pieces. */}
            <div className="rounded-xl border border-dashed border-primary/60 bg-background px-5 py-4 text-left">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-text" />
                10% Off First Rental
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                DM <span className="font-semibold tracking-wider">&quot;FIRST10&quot;</span> after following to claim your discount
              </p>
            </div>

            <a
              data-magnetic
                href={`https://instagram.com/${HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[transform,background-color,box-shadow] duration-200 hover:bg-primary/90 hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.7)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Instagram className="h-4 w-4" aria-hidden />
              Follow @{HANDLE}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>
        </motion.div>

        {/* ── Reel strip — fetches only near the viewport; if the feed fails, our own photo bento takes its place. ── */}
        <motion.div {...reveal(0.1)} className="lg:col-span-7 xl:col-span-8">
          {feedOk ? (
            <InstagramFeed account={account} variant="gallery" onUnavailable={onUnavailable} />
          ) : (
            <InstagramFallback handle={HANDLE} account={account} />
          )}
        </motion.div>
      </div>
    </section>
  );
}
