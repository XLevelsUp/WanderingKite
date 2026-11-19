import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import type { Album } from '@/lib/photography/data';
import { AlbumCard } from './AlbumCard';
import { MediaPlaceholder } from './MediaPlaceholder';

/** Album grid: 1 → 2 (sm) → 3 (lg) → 4 (3xl) columns. Empty state shows placeholder frames + a booking CTA instead of a blank page. */
export function AlbumGrid({
  albums,
  showCategory = true,
  emptyLabel = 'Albums coming soon',
  whatsappMessage,
  compact = false,
}: {
  albums: Album[];
  showCategory?: boolean;
  emptyLabel?: string;
  whatsappMessage?: string;
  /** One compact row: 2 columns on phones, 4 from lg, tighter gaps (used for teasers like the hub's Featured stories). */
  compact?: boolean;
}) {
  if (albums.length === 0) {
    return (
      <div>
        <ul aria-hidden className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2].map((i) => (
            <li key={i} className={i > 0 ? 'hidden sm:block' : ''}>
              <MediaPlaceholder className="aspect-[4/5] rounded-2xl" label={i === 0 ? emptyLabel : undefined} />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-muted-foreground">We&apos;re curating this gallery. Ask us for recent work on WhatsApp.</p>
          <a
            href={generateWhatsAppLink('photography', whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            See recent work
          </a>
        </div>
      </div>
    );
  }

  return (
    <ul
      className={
        compact
          ? 'grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6'
          : 'grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 3xl:grid-cols-4'
      }
    >
      {albums.map((a, i) => (
        <li key={a.id} className="reveal">
          <AlbumCard album={a} priority={i < 2} showCategory={showCategory} compact={compact} />
        </li>
      ))}
    </ul>
  );
}

/** Previous / Next with "page x of y"; plain links so it works without JS and is crawlable. */
export function Pagination({ page, pageCount, hrefFor }: { page: number; pageCount: number; hrefFor: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const btn = 'inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const off = 'pointer-events-none opacity-40';
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-8">
      <Link href={hrefFor(page - 1)} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} className={`${btn} ${page <= 1 ? off : ''}`}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
      </Link>
      <p className="text-sm tabular-nums text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      <Link href={hrefFor(page + 1)} aria-disabled={page >= pageCount} tabIndex={page >= pageCount ? -1 : undefined} className={`${btn} ${page >= pageCount ? off : ''}`}>
        Next <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </nav>
  );
}
