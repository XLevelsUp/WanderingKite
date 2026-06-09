'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error('[Dashboard Boundary Error]:', error);
  }, [error]);

  return (
    <div className="flex min-h-[450px] items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-500/20 bg-background/50 backdrop-blur-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            System Error
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            We encountered a problem fetching or displaying this screen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3 text-center">
            <p className="font-mono text-xs font-semibold text-red-400 leading-normal">
              {error.message || 'An unexpected server-side exception occurred.'}
            </p>
          </div>
          <p className="text-xs text-center text-muted-foreground/60">
            This might be due to a temporary network drop, insufficient authorization, or backend database downtime.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2.5">
          <Button
            onClick={() => reset()}
            className="w-full gap-2 text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboard" className="w-full" passHref>
            <Button
              variant="outline"
              className="w-full gap-2 text-sm font-semibold border-white/10 hover:bg-white/5"
            >
              <Home className="h-4 w-4" />
              Return Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
