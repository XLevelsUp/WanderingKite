'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Copy unchanged from the previous services grid.
const SERVICES = [
  {
    title: 'Photography',
    tagline: 'Event & Lifestyle',
    description: 'Event and lifestyle photography that captures authentic moments with cinematic precision.',
    href: '/photography',
    badge: 'Popular',
    features: ['Weddings & Events', 'Commercial Shoots', 'Portrait Sessions'],
    src: '/images/services/photography.webp',
    alt: 'Bride and groom in garlands at their wedding',
  },
  {
    title: 'Studio Space',
    tagline: '1200 sq ft',
    description: 'Premium studio facilities for photography and video production.',
    href: '/studiospace',
    badge: 'New',
    features: ['Infinity Wall', 'ProFoto Lighting', 'Green Screen'],
    src: '/images/studio/placeholder1.webp',
    alt: 'Wandering Kite studio with a white infinity wall, softbox and LED ceiling light',
  },
] as const;

const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;

export function ServicesSection() {
  const reduce = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SETTLE, delay },
  });

  return (
    // id + scroll-mt: target of the hero's scroll cue, clear of the 80px fixed nav.
    <section id="services" aria-labelledby="services-heading" className="scroll-mt-20 border-y border-border bg-card">
      {/* Strict spacing (8px grid): top 24/32 (joins Values at one block gap: 48 → 64), bottom 64/80/96/112, header→cards 48 → 64, card gap 24/32. */}
      <div className="mx-auto w-full max-w-7xl px-5 pb-6 pt-6 sm:px-8 lg:px-12 lg:pb-8 lg:pt-8 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        <motion.div {...reveal(0)}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-text sm:text-xs">What We Offer</p>
          <h2
            id="services-heading"
            className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl"
          >
            Our Services
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:mt-16 lg:gap-8">
          {SERVICES.map((s, i) => (
            <motion.div key={s.href} {...reveal(0.08 * (i + 1))} className="h-full">
              <Link
                href={s.href}
                aria-label={`Explore ${s.title} services by Wandering Kite Studio`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_hsl(var(--foreground)/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                {/* Photo on top at its true 3:2 — nothing overlaps or crops the subject. Slow zoom on hover (transform only). */}
                <div data-shutter className="relative aspect-[3/2] overflow-hidden bg-muted 2xl:aspect-[16/9]">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1536px) 51rem, (min-width: 768px) 50vw, 100vw"
                    className="object-cover brightness-[0.88] transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
                    <span className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] tabular-nums text-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {/* Sandstone chip, black label — orange on sandstone fails contrast. */}
                    <span className="rounded-full bg-neutral px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                      {s.badge}
                    </span>
                  </div>
                </div>

                {/* Copy panel — 8px grid: 24/32 padding, 8 → 16 → 24 → 24 rhythm. mt-auto keeps both CTAs on one line. */}
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">{s.tagline}</p>
                  <h3 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-foreground">{s.description}</p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.features.map((f) => (
                      <li key={f} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Visual button — the whole card is the link. mt-auto pins it to the bottom; pt-6 guarantees 24px above it. */}
                  <div className="mt-auto pt-6">
                  <span className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[background-color,box-shadow] duration-200 group-hover:bg-primary/90 group-hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.7)]">
                    Explore {s.title}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
