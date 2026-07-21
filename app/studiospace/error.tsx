'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

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
    <div className="relative flex min-h-[600px] flex-col items-center justify-center px-4 py-16 text-center bg-[#0a0a0c]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Inventory Offline
          </h1>
          <p className="text-sm text-foreground/60 max-w-xs mx-auto">
            We are experiencing temporary difficulties loading our studio space details.
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-center">
          <p className="font-mono text-xs text-indigo-300/90 leading-relaxed">
            {error.message || 'Unable to connect to the database.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Catalog
          </Button>
          <Link href="/" passHref>
            <Button
              variant="outline"
              className="inline-flex items-center gap-2 border-white/10 hover:bg-white/5 text-foreground/80 font-semibold py-2.5 px-6 rounded-xl transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
