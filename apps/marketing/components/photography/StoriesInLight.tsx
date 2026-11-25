'use client';

import { useEffect, useRef, useState } from 'react';
import { storiesFont } from '@/lib/fonts';

/**
 * Brand tagline "Stories in Light" (Wandering Kite Photography).
 * - variant "band": centred statement section — serif words rise in, rules draw out, a beam of light sweeps across "Light".
 * - variant "line": the same lockup at hero-eyebrow size, for placing above a page headline.
 * Self-contained reveal (works on pages with or without PhotoMotion); reduced motion shows it static.
 */
export function StoriesInLight({ variant = 'band' }: { variant?: 'band' | 'line' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  // Start the "Light" sweep (CSS .sweep-on) on the first interaction, not during page load.
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains('sweep-on')) return;
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const;
    const on = () => {
      root.classList.add('sweep-on');
      events.forEach((e) => window.removeEventListener(e, on));
    };
    events.forEach((e) => window.addEventListener(e, on, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, on));
  }, []);

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
      className={`inline-block transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${extra}`}
      style={{ transitionDelay: `${i * 140}ms` }}
    >
      {text}
    </span>
  );

  if (variant === 'line') {
    return (
      <div ref={ref} className={`${storiesFont.className} flex items-center gap-3 text-lg font-normal leading-none tracking-wide text-foreground sm:text-xl`}>
        <span aria-hidden="true" className="h-px w-6 bg-accent-text/70" />
        <p>
          {word('Stories', 0)} {word('in', 1)} {word('Light', 2, 'light-sweep font-normal')}
        </p>
      </div>
    );
  }

  return (
    <section ref={ref} aria-labelledby="tagline-heading" className="relative overflow-hidden border-b border-border/60 bg-background">
      <h2 id="tagline-heading" className="sr-only">Stories in Light — Wandering Kite Photography</h2>
      <div className="relative mx-auto w-full max-w-7xl px-5 py-6 text-center sm:px-8 sm:py-7 lg:px-12">
        <p className={`${storiesFont.className} text-2xl font-normal leading-snug tracking-wide text-foreground sm:text-3xl lg:text-4xl`}>
          {word('Stories', 0)} {word('in', 1)} {word('Light', 2, 'light-sweep font-normal')}
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-3 sm:gap-4">
          <span aria-hidden className={`h-px w-6 shrink-0 origin-right bg-gradient-to-l from-accent-text/60 to-transparent transition-transform delay-300 duration-700 sm:w-12 ${inView ? 'scale-x-100' : 'scale-x-0'}`} />
          <span className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/60 sm:text-[11px] sm:tracking-[0.28em] transition-opacity delay-500 duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            Wandering Kite Photography
          </span>
          <span aria-hidden className={`h-px w-6 shrink-0 origin-left bg-gradient-to-r from-accent-text/60 to-transparent transition-transform delay-300 duration-700 sm:w-12 ${inView ? 'scale-x-100' : 'scale-x-0'}`} />
        </div>
      </div>
    </section>
  );
}
