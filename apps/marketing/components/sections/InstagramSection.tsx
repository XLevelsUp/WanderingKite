'use client';

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Instagram, Play, Camera, Aperture, Clapperboard, Lightbulb, Sparkles } from 'lucide-react';
import { InstagramFeed } from '@/components/shared/InstagramFeed';

const HANDLES = { wanderingkite: 'wanderingkitestudio', studio: 'studiospacecbe' } as const;

// Image-free tiles: theme-token gradients (light/dark orange on studio, taupe on the landing page) with one craft icon each.
const TILES = [
  { Icon: Play, tone: 'from-primary-deep/40 via-primary/15 to-transparent' },
  { Icon: Camera, tone: 'from-primary/25 to-transparent' },
  { Icon: Aperture, tone: 'from-transparent to-primary-deep/30' },
  { Icon: Lightbulb, tone: 'from-primary/10 via-transparent to-primary/25' },
  { Icon: Clapperboard, tone: 'from-primary-deep/30 to-primary/5' },
  { Icon: Sparkles, tone: 'from-transparent via-primary/10 to-primary-deep/40' },
] as const;

/* Feed-down fallback without photos: profile-style panel (avatar ring + handle) over a 3×2 grid of gradient tiles; the whole panel opens Instagram. */
function InstagramFallback({ handle }: { handle: string }) {
  return (
    <a
      href={`https://instagram.com/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View @${handle} on Instagram`}
      className="group block rounded-2xl border border-border bg-background p-4 transition-colors duration-300 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
    >
      <div className="flex items-center gap-4">
        <span aria-hidden className="rounded-full bg-gradient-to-tr from-primary-deep to-primary p-0.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-primary">
            <Instagram className="h-5 w-5" />
          </span>
        </span>
        <p className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">@{handle}</p>
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <ul aria-hidden className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-4">
        {TILES.map(({ Icon, tone }, i) => (
          <li
            key={i}
            className={`flex aspect-square items-center justify-center rounded-xl border border-border bg-card bg-gradient-to-br sm:aspect-[4/3] ${tone}`}
          >
            <Icon className="h-6 w-6 text-foreground/40 transition-[color,transform] duration-500 group-hover:scale-110 group-hover:text-primary motion-reduce:transition-none" />
          </li>
        ))}
      </ul>
    </a>
  );
}
const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;

/* Compact one-band Instagram section; `account` picks the handle and feed (studio pages use studiospacecbe). */
export function InstagramSection({ account = 'wanderingkite', first = false }: { account?: keyof typeof HANDLES; first?: boolean }) {
  const HANDLE = HANDLES[account];
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
      {/* Strict spacing (8px grid): py 64/80/96 (top = 80px header + 32/48/64 when first on the page), block gap 48 → 64 at lg. */}
      <div className={`mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16 ${first ? 'pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36' : 'py-16 sm:py-20 lg:py-24'}`}>
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
            <InstagramFallback handle={HANDLE} />
          )}
        </motion.div>
      </div>
    </section>
  );
}
