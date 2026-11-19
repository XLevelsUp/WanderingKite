'use client';

import { useEffect } from 'react';

/** Drives the photography hub's [data-reveal] animations (CSS in globals.css). Renders nothing. */
export function PhotoMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('pm-motion');

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

    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    scan();
    const late = window.setTimeout(scan, 1500);

    return () => {
      window.clearTimeout(late);
      io.disconnect();
      root.classList.remove('pm-motion');
    };
  }, []);

  return null;
}
