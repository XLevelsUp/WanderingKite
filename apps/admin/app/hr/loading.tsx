import { Loader2 } from 'lucide-react';

/**
 * Fallback while the /hr segment's data (auth check + role gate) resolves
 * before the page renders. Covers the whole /hr/* section.
 */
export default function AdminShellLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0A0A0B] text-foreground/45">
      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      <p className="text-sm font-medium animate-pulse">Loading...</p>
    </div>
  );
}
