'use client';

import { useEffect } from 'react';

/**
 * Loads third-party tags (analytics, pixels) only after the visitor first interacts — scroll, tap, key or
 * mouse move — or after `fallbackMs` if they don't. Keeps their JavaScript off the main thread while the
 * page itself is loading (Lighthouse TBT), at the cost of not counting visitors who leave within that time.
 *
 * `code` runs first (e.g. defines dataLayer/gtag or the fbq stub), then `src` is loaded. Renders nothing.
 */
export function AfterInteraction({ id, code, src, fallbackMs = 8000 }: { id: string; code?: string; src?: string; fallbackMs?: number }) {
  useEffect(() => {
    if (document.getElementById(`ai-${id}`)) return; // already loaded (client navigation)
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const;
    let done = false;

    const run = () => {
      if (done) return;
      done = true;
      cleanup();
      if (code) {
        const s = document.createElement('script');
        s.id = `ai-${id}`;
        s.text = code;
        document.head.appendChild(s);
      }
      if (src) {
        const s = document.createElement('script');
        if (!code) s.id = `ai-${id}`;
        s.src = src;
        s.async = true;
        document.head.appendChild(s);
      }
    };

    const timer = window.setTimeout(run, fallbackMs);
    const cleanup = () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, run));
    };
    events.forEach((e) => window.addEventListener(e, run, { once: true, passive: true }));
    return cleanup;
  }, [id, code, src, fallbackMs]);

  return null;
}
