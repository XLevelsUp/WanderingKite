import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-foreground/45">
      <Loader2 className="w-8 h-8 animate-spin text-primary/70" />
      <p className="text-sm font-medium animate-pulse">Loading administration data...</p>
    </div>
  );
}
