'use client';

import { useEffect, useState } from 'react';
import { isOpenNow } from '@/lib/hours';

/**
 * "Open now / Closed now" for the footer — the only part of the footer that needs the browser.
 * Worked out after mount in IST and refreshed every minute, so static HTML never carries a stale status.
 */
export function OpenNowStatus() {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    setOpen(isOpenNow());
    const t = window.setInterval(() => setOpen(isOpenNow()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  if (open === null) return null;
  return (
    <span className="mb-1 flex items-center gap-2 font-medium text-foreground">
      <span className={`h-2 w-2 rounded-full ${open ? 'bg-green-600' : 'bg-foreground/40'}`} />
      {open ? 'Open now' : 'Closed now'}
    </span>
  );
}
