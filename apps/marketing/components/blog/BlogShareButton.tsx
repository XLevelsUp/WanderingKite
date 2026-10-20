'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

export function BlogShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Native share sheet where available (mobile); clipboard everywhere else.
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User dismissed the sheet — fall through to copying.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-white"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          Share this post
        </>
      )}
    </button>
  );
}
