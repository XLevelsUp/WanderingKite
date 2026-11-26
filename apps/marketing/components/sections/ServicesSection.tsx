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
    imagePill: 'View Packages & Portfolio',
    ctaText: 'View Portfolio & Book',
    features: ['Weddings & Events', 'Commercial Shoots', 'Portrait Sessions'],
    src: '/images/services/wedding-couple-portrait.webp',
    alt: 'South Indian bride and groom in traditional attire sharing an intimate portrait under a tree',
  },
  {
    title: 'Studio Space',
    tagline: '1200 sq ft',
    description: 'Premium studio facilities for photography and video production.',
    href: '/studiospace',
    badge: 'Available',
    imagePill: 'View Studio & Rates',
    ctaText: 'View Studio & Book',
    features: ['Infinity Wall', 'Godox Pro Lighting', 'Green Screen'],
    src: '/images/studio/studio-floor-infinity-wall.webp',
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
    // Highlighted band: warm orange glow behind the header + an orange rule on top, so "book here" stands out on the page.
    <section id="services" aria-labelledby="services-heading" className="relative scroll-mt-20 overflow-hidden border-y border-border bg-card">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent-bright to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[min(70rem,120vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,85,0,0.12),rgba(255,138,76,0.06)_55%,transparent)]" />
      {/* Strict spacing (8px grid): top 24/32 (joins Values at one block gap: 48 → 64), bottom 64/80/96/112, header→cards 48 → 64, card gap 24/32. */}
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-12 lg:pb-16 lg:pt-16 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        <motion.div {...reveal(0)}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-bright sm:text-xs">What We Offer</p>
          {/* Compact header */}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="services-heading"
              className="text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl"
            >
              Our Services
            </h2>
            {/* Live status pill: glowing orange, so the section reads as "book now". */}
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-accent-bright/40 bg-accent-bright/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground shadow-[0_8px_24px_-12px_rgba(255,85,0,0.6)] sm:self-auto">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent-bright opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-bright" />
              </span>
              Open for Bookings
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/80">
            Choose a service below to explore portfolios, view transparent packages, and book your date directly with our team.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:mt-10 lg:gap-8">
          {SERVICES.map((s, i) => (
            <motion.div key={s.href} {...reveal(0.08 * (i + 1))} className="h-full">
              <Link
                href={s.href}
                aria-label={`${s.ctaText} - Wandering Kite Studio`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-bright hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                {/* Photo on top at true 3:2 inside overflow-hidden wrapper with gentle zoom */}
                <div data-shutter className="relative aspect-[3/2] overflow-hidden bg-muted 2xl:aspect-[16/9]">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1536px) 51rem, (min-width: 768px) 50vw, 100vw"
                    className="object-cover brightness-[0.88] transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />

                  {/* Corner chips */}
                  <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
                    <span className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] tabular-nums text-foreground shadow-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="rounded-full bg-accent-bright px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black shadow-[0_6px_16px_-6px_rgba(255,85,0,0.7)]">
                      {s.badge}
                    </span>
                  </div>

                  {/* Subtle dark gradient hover overlay with interactive pill */}
                  <div className="absolute inset-0 z-10 flex items-end justify-center pb-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-4 py-1.5 text-xs font-semibold tracking-wide text-foreground shadow-md transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                      {s.imagePill}
                      <ArrowRight className="h-3.5 w-3.5 text-accent-text" aria-hidden />
                    </span>
                  </div>
                </div>

                {/* Copy panel */}
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">{s.tagline}</p>
                  <h3 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl text-foreground group-hover:text-accent-bright transition-colors duration-200">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/80">{s.description}</p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.features.map((f) => (
                      <li key={f} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground bg-muted/30">
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Visible CTA Footer Row pinned to the bottom */}
                  <div className="mt-auto pt-6 border-t border-border/60 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground group-hover:text-accent-text transition-colors duration-200 inline-flex items-center gap-1.5">
                      {s.ctaText}
                    </span>
                    {/* Button-like circular arrow element that fills with brand color on hover */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all duration-200 group-hover:border-accent-bright group-hover:bg-accent-bright group-hover:text-black shadow-xs">
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                    </div>
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
