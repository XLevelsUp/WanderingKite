'use client';

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Instagram } from 'lucide-react';
import { InstagramFeed } from '@/components/shared/InstagramFeed';

const HANDLE = 'wanderingkitestudio';
const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;

/* Compact one-band Instagram section. */
export function InstagramSection() {
  const reduce = useReducedMotion();
  const [feedOk, setFeedOk] = useState(true);
  const onUnavailable = useCallback(() => setFeedOk(false), []);
  const reveal = (delay = 0) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SETTLE, delay },
  });

  return (
    <section className="relative border-y border-border bg-card" aria-label="Follow us on Instagram">
      {/* Strict spacing (8px grid): py 64/80/96, block gap 48 → 64 at lg, inner 24/32. Same width steps as the hero. */}
      <div className={`mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 ${feedOk ? 'lg:grid-cols-12' : ''} lg:gap-16 lg:px-12 lg:py-24 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16`}>
        {/* ── Header ── */}
        {/* Tablet (md–lg): copy left, offer right, so the header spans the same width as the reel strip below. */}
        <motion.div
          {...reveal(0)}
          className={feedOk ? 'md:grid md:grid-cols-2 md:items-end md:gap-8 lg:col-span-5 lg:block xl:col-span-4' : 'mx-auto flex max-w-xl flex-col items-center text-center 2xl:max-w-2xl'}
        >
          <div className={feedOk ? '' : 'flex flex-col items-center'}>
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

          <div className={`mt-8 flex w-full max-w-md flex-col gap-4 ${feedOk ? 'md:mt-0 md:max-w-none lg:mt-8 lg:max-w-md' : ''}`}>
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

        {/* ── Reel strip — fetches only near the viewport; on failure the column is removed (see feedOk). ── */}
        {feedOk && (
          <motion.div {...reveal(0.1)} className="lg:col-span-7 xl:col-span-8">
            <InstagramFeed account="wanderingkite" variant="gallery" onUnavailable={onUnavailable} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
