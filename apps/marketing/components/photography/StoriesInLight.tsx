'use client';

import { useEffect, useRef, useState } from 'react';
import { storySerif } from '@/lib/fonts';

/**
 * Brand tagline "Stories in Light" (Wandering Kite Photography).
 * - variant "band": centred statement section — serif words rise in, rules draw out, a beam of light sweeps across "Light".
 * - variant "line": the same lockup at hero-eyebrow size, for placing above a page headline.
 * Self-contained reveal (works on pages with or without PhotoMotion); reduced motion shows it static.
 */
export function StoriesInLight({ variant = 'band' }: { variant?: 'band' | 'line' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already visible on load: no hide/re-show flash
    setInView(false);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const word = (text: string, i: number, extra = '') => (
    <span
      className={`inline-block transition-[opacity,transform,filter] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${inView ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-6 opacity-0 blur-sm'} ${extra}`}
      style={{ transitionDelay: `${i * 140}ms` }}
    >
      {text}
    </span>
  );

  if (variant === 'line') {
    return (
      <div ref={ref} className={`${storySerif.className} flex items-center gap-3 text-2xl font-medium leading-none text-foreground sm:text-[1.75rem]`}>
        <span aria-hidden className="h-px w-8 bg-accent-text/60" />
        <p aria-label="Stories in Light">
          <span aria-hidden>
            {word('Stories', 0)} {word('in', 1)} {word('Light', 2, 'light-sweep italic font-semibold')}
          </span>
        </p>
      </div>
    );
  }

  return (
    <section ref={ref} aria-label="Stories in Light — Wandering Kite Photography" className="relative overflow-hidden">
      {/* Warm glow: the "light" behind the words. */}
      <div aria-hidden className={`pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[min(48rem,90vw)] sm:h-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,138,76,0.18),rgba(203,185,164,0.18)_55%,transparent)] transition-opacity duration-[1600ms] ${inView ? 'opacity-100' : 'opacity-0'}`} />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-12">
        <p className={`${storySerif.className} text-[3.25rem] font-medium leading-[1.05] tracking-[-0.01em] text-foreground sm:text-7xl lg:text-[5.5rem]`}>
          {word('Stories', 0)} {word('in', 1)} {word('Light', 2, 'light-sweep italic font-semibold')}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
          <span aria-hidden className={`h-px w-6 shrink-0 origin-right bg-gradient-to-l from-accent-text/70 to-transparent transition-transform delay-500 duration-1000 sm:w-20 ${inView ? 'scale-x-100' : 'scale-x-0'}`} />
          <span className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/60 sm:text-[11px] sm:tracking-[0.3em] transition-opacity delay-700 duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            Wandering Kite Photography
          </span>
          <span aria-hidden className={`h-px w-6 shrink-0 origin-left bg-gradient-to-r from-accent-text/70 to-transparent transition-transform delay-500 duration-1000 sm:w-20 ${inView ? 'scale-x-100' : 'scale-x-0'}`} />
        </div>
      </div>
    </section>
  );
}
