'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

// Last-resort fallback only: data fetches and the pricing engine fail locally, so this shows just for unexpected crashes.
export default function StudioSpaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('[Studio Space Boundary Error]:', error);
  }, [error]);

  return (
    <div data-theme="studio" className="flex min-h-[600px] flex-col items-center justify-center bg-background px-5 pb-16 pt-28 text-center text-foreground">
      <div className="w-full max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary-deep/50 bg-primary-deep/15 text-primary">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Inventory Offline</h1>
        <p className="mx-auto mt-2 max-w-xs text-base text-muted-foreground">
          We are experiencing temporary difficulties loading our studio space details.
        </p>
        {/* Raw error text is never shown publicly; the digest lets us match the server log. */}
        {error.digest && <p className="mt-4 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-deep to-primary px-6 text-sm font-semibold text-primary-foreground transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Catalog
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
