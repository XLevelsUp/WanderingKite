'use client';

import { useEffect } from 'react';

/** Drives the photography hub's [data-reveal] animations (CSS in globals.css). Renders nothing. */
export function PhotoMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    // Anything already on screen when the page opens stays visible: only content below the first screen
    // gets the reveal. Hiding painted content (even briefly) delays LCP/Speed Index and causes a flash.
    // Which elements are on (or above) the first screen comes from an IntersectionObserver's first report rather than
    // getBoundingClientRect: measuring synchronously right after hydration forced a full layout (~70ms "forced reflow").
    // Only once those are marked does .pm-motion switch the hide-until-revealed styles on.
    let started = false;
    const first = new IntersectionObserver((entries) => {
      first.disconnect();
      for (const e of entries) if (e.isIntersecting || e.boundingClientRect.bottom < 0) e.target.classList.add('is-in');
      root.classList.add('pm-motion');
      started = true;
      scan();
    });
    document.querySelectorAll('[data-reveal]').forEach((el) => first.observe(el));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Also release anything already scrolled past (back navigation restores scroll mid-page).
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    const scan = () => started && document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    const late = window.setTimeout(scan, 1500);

    return () => {
      window.clearTimeout(late);
      first.disconnect();
      io.disconnect();
      root.classList.remove('pm-motion');
    };
  }, []);

  return null;
}
