import { Loader2 } from 'lucide-react';

/**
 * Fallback while the (shell) layout itself resolves — auth check,
 * profile fetch, and reminders all await before the sidebar shell renders.
 * Without this, that fetch has no visible loading state at all (an inner
 * route's own loading.tsx only covers the page inside the shell, not the
 * shell's own data-fetching layout).
 */
export default function DashboardShellLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0A0A0B] text-foreground/45">
      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      <p className="text-sm font-medium animate-pulse">Loading...</p>
    </div>
  );
}
