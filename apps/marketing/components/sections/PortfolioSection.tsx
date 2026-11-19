'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';

type Cat = 'events' | 'portraits' | 'corporate' | 'commercial';
type Work = { cat: Cat; id: string; title: string; w: number; h: number };

// Web copies of public/images/photography/<cat>/<id>.webp (public/images/portfolio).
const COLUMNS: Work[][] = [
  [
    { cat: 'events', id: 'wedding', title: 'Wedding', w: 1400, h: 933 },
    { cat: 'portraits', id: 'maternity', title: 'Maternity', w: 667, h: 1000 },
    { cat: 'portraits', id: 'family', title: 'Family', w: 1400, h: 933 },
  ],
  [
    { cat: 'corporate', id: 'product', title: 'Product', w: 1400, h: 933 },
    { cat: 'corporate', id: 'headshots', title: 'Headshots', w: 667, h: 1000 },
    { cat: 'events', id: 'engagements', title: 'Engagements', w: 1400, h: 933 },
  ],
  [
    { cat: 'commercial', id: 'music-videos', title: 'Music Videos', w: 667, h: 1000 },
    { cat: 'events', id: 'house-warming', title: 'House Warming', w: 1400, h: 933 },
    { cat: 'portraits', id: 'baby-shoots', title: 'Baby Shoots', w: 1400, h: 899 },
  ],
];
// Reading order (row by row) for the carousel and viewer.
const WORK: Work[] = [0, 1, 2].flatMap((r) => COLUMNS.map((c) => c[r]));

const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;
const src = (w: Work) => `/images/portfolio/${w.cat}-${w.id}.webp`;
const href = (w: Work) => `/photography/${w.cat}/${w.id}`;
const pad2 = (n: number) => String(n).padStart(2, '0');
const indexOf = (w: Work) => WORK.findIndex((x) => x.id === w.id);

/** Photo tile: true aspect (no crop), number + title + category caption, opens the viewer. */
function Tile({ w, onOpen, frameClass = '' }: { w: Work; onOpen: (i: number, el: HTMLButtonElement) => void; frameClass?: string }) {
  const reduce = useReducedMotion();
  const i = indexOf(w);
  return (
    <figure>
      <button
        type="button"
        onClick={(e) => onOpen(i, e.currentTarget)}
        aria-label={`Open ${w.title} photo`}
        data-shutter
        className={`group relative block w-full overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${frameClass}`}
        style={frameClass ? undefined : { aspectRatio: `${w.w} / ${w.h}` }}
      >
        <motion.div layoutId={reduce ? undefined : `work-${w.id}`} className="absolute inset-0">
          <Image
            src={src(w)}
            alt={`${w.title} photography by Wandering Kite`}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 84vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </motion.div>
      </button>
      <figcaption className="mt-3 flex items-baseline gap-3">
        <span className="text-[11px] font-semibold tabular-nums tracking-[0.2em] text-accent-text">{pad2(i + 1)}</span>
        <span className="text-sm font-semibold text-foreground">{w.title}</span>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">{w.cat}</span>
      </figcaption>
    </figure>
  );
}

export function PortfolioSection() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const onOpen = (i: number, el: HTMLButtonElement) => { triggerRef.current = el; setOpen(i); };

  // One structure on every screen.
  const trackRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const step = (t: HTMLDivElement) => ((t.firstElementChild as HTMLElement | null)?.offsetWidth ?? t.clientWidth) + 16;
  const goTo = (i: number) => {
    const t = trackRef.current;
    if (t) t.scrollTo({ left: Math.max(0, i) * step(t), behavior: reduce ? 'auto' : 'smooth' });
  };
  const sync = () => {
    const t = trackRef.current;
    if (!t) return;
    setSlide(Math.min(WORK.length - 1, Math.round(t.scrollLeft / step(t))));
    setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 2);
  };
  useEffect(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reveal = (delay = 0) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SETTLE, delay },
  });

  return (
    <section aria-labelledby="work-heading" className="border-b border-border bg-background">
      {/* Spacing (8px grid): top 24/32 (one block gap below Services), bottom 64/80/96, header→controls 32, controls→row 24. */}
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24 lg:pt-8 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        <motion.div {...reveal(0)} className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-text sm:text-xs">Portfolio</p>
            <h2 id="work-heading" className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
              Selected Work
            </h2>
          </div>
          <Link
            href="/photography"
            className="group hidden h-11 shrink-0 items-center gap-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:text-accent-text sm:inline-flex"
          >
            Explore Photography
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </motion.div>

        <motion.div {...reveal(0.08)}>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-[11px] font-semibold tabular-nums tracking-[0.24em] text-foreground" aria-live="polite">
              {pad2(slide + 1)} <span className="text-foreground/50">/ {pad2(WORK.length)}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goTo(slide - 1)}
                disabled={slide === 0}
                aria-label="Previous photo"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary bg-background text-foreground transition-[transform,opacity,background-color] duration-200 hover:bg-card active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goTo(slide + 1)}
                disabled={atEnd}
                aria-label="Next photo"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[transform,opacity,background-color] duration-200 hover:bg-primary/90 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div
            ref={trackRef}
            onScroll={sync}
            className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {WORK.map((w) => (
              <div
                key={w.id}
                className="w-[84%] shrink-0 snap-start md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] 2xl:w-[calc((100%-3rem)/4)]"
              >
                <Tile w={w} onOpen={onOpen} frameClass="aspect-[4/5]" />
              </div>
            ))}
          </div>
        </motion.div>

        <Link
          href="/photography"
          className="group mt-6 inline-flex h-11 items-center gap-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:text-accent-text sm:hidden"
        >
          Explore Photography
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      <Lightbox
        items={WORK}
        index={open}
        onClose={() => { setOpen(null); triggerRef.current?.focus(); }}
        onIndex={setOpen}
        reduce={!!reduce}
      />
    </section>
  );
}

/** Light full-screen viewer (porcelain): the clicked photo grows into place; Esc closes, ←/→ step. */
function Lightbox({
  items,
  index,
  onClose,
  onIndex,
  reduce,
}: {
  items: Work[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  reduce: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const step = useCallback(
    (d: number) => { if (index !== null) onIndex((index + d + items.length) % items.length); },
    [index, items.length, onIndex]
  );

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [index, onClose, step]);

  const w = index !== null ? items[index] : null;
  const ctl =
    'flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <AnimatePresence>
      {w && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${w.title} photo`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          className="fixed inset-0 z-[60] flex flex-col bg-background"
          onClick={onClose}
        >
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-8" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-foreground">
              {w.title}{' '}
              <span className="ml-2 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
                {pad2(index! + 1)} / {pad2(items.length)}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <Link
                href={href(w)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {w.title}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={ctl}>
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-5 py-8 sm:px-24">
            <motion.div
              layoutId={reduce ? undefined : `work-${w.id}`}
              className="relative max-h-full w-full overflow-hidden rounded-xl shadow-[0_24px_48px_-24px_hsl(var(--foreground)/0.35)]"
              style={{ aspectRatio: `${w.w} / ${w.h}`, maxWidth: `calc((100svh - 10rem) * ${w.w / w.h})` }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={src(w)} alt={`${w.title} photography by Wandering Kite`} fill sizes="100vw" className="object-contain" />
            </motion.div>

            {items.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo" className={`absolute left-3 top-1/2 -translate-y-1/2 sm:left-8 ${ctl}`}>
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo" className={`absolute right-3 top-1/2 -translate-y-1/2 sm:right-8 ${ctl}`}>
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
