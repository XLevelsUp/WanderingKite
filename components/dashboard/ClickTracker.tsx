'use client';

import { useEffect, useRef } from 'react';
import { getStoredSessionId } from '@/lib/clientSession';

const FLUSH_INTERVAL_MS = 5_000;
const TRACK_URL = '/api/track/click';
const MAX_LABEL_LENGTH = 60;

interface BufferedClick {
  label: string;
  path: string;
  elementTag: string;
}

/**
 * Invisible, mounted once in the dashboard layout. A single capture-phase
 * click listener auto-detects clicks on any button/link app-wide — no
 * per-component instrumentation needed. Label preference: an explicit
 * data-track-label override, then aria-label, then the element's own
 * visible text. Batches and flushes on a timer, plus reliably on tab
 * close via sendBeacon.
 */
export function ClickTracker() {
  const bufferRef = useRef<BufferedClick[]>([]);

  useEffect(() => {
    const flush = (useBeacon: boolean) => {
      if (bufferRef.current.length === 0) return;
      const events = bufferRef.current;
      bufferRef.current = [];
      const payload = JSON.stringify({
        events,
        sessionId: getStoredSessionId(),
      });

      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(TRACK_URL, blob);
      } else {
        fetch(TRACK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {
          // Best-effort — dropped click events aren't worth retry complexity.
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>(
        'button, a, [role="button"], [data-track-label]'
      );
      if (!el) return;
      if (el.hasAttribute('data-no-track')) return;

      const label =
        el.dataset.trackLabel?.trim() ||
        el.getAttribute('aria-label')?.trim() ||
        el.innerText?.trim().slice(0, MAX_LABEL_LENGTH) ||
        '';
      if (!label) return;

      bufferRef.current.push({
        label,
        path: window.location.pathname,
        elementTag: el.tagName.toLowerCase(),
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', () => flush(true));

    const interval = setInterval(() => flush(false), FLUSH_INTERVAL_MS);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      flush(true);
    };
  }, []);

  return null;
}
