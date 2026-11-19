import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { albumHref, albumTitle, formatShootDate, type Album } from '@/lib/photography/data';
import { MediaPlaceholder } from './MediaPlaceholder';

/** Picture-led album card: 4:5 cover, names, city · date. Hover = slow cover zoom + arrow nudge (transform only). */
export function AlbumCard({ album, priority = false, showCategory = true, compact = false }: { album: Album; priority?: boolean; showCategory?: boolean; compact?: boolean }) {
  const title = albumTitle(album);
  const date = formatShootDate(album.shoot_date);
  return (
    <Link
      href={albumHref(album)}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-card">
        {album.cover_image_url ? (
          <Image
            src={album.cover_image_url}
            alt={`${title}${album.category ? ` — ${album.category.name}` : ''} photography by Wandering Kite`}
            fill
            priority={priority}
            sizes="(min-width: 1920px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        ) : (
          <MediaPlaceholder className="absolute inset-0" label="Cover coming soon" />
        )}
        {/* Bottom scrim keeps the city chip legible on any photo. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
        {album.city && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <MapPin className="h-3 w-3" aria-hidden />
            {album.city.name}
          </span>
        )}
      </div>
      {/* Compact (2-up on phones): no arrow chip below sm and titles wrap to 2 lines instead of truncating. */}
      <div className={`flex items-start justify-between gap-4 ${compact ? 'mt-3 sm:mt-4' : 'mt-4'}`}>
        <div className="min-w-0">
          {showCategory && album.category && (
            <p className={`font-semibold uppercase text-accent-text ${compact ? 'text-[10px] tracking-[0.16em] sm:text-[11px] sm:tracking-[0.2em]' : 'text-[11px] tracking-[0.2em]'}`}>{album.category.name}</p>
          )}
          <h3 className={`mt-1 font-semibold tracking-tight text-foreground ${compact ? 'line-clamp-2 text-base sm:truncate sm:text-lg' : 'truncate text-lg'}`}>{title}</h3>
          {date && <p className="mt-1 text-sm text-muted-foreground">{date}</p>}
        </div>
        <span aria-hidden className={`mt-1 h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-[transform,background-color,color,border-color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground ${compact ? 'hidden sm:flex' : 'flex'}`}>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
