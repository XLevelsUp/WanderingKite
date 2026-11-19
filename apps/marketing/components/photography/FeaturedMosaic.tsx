import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { albumHref, albumTitle, formatShootDate, type Album } from '@/lib/photography/data';
import { MediaPlaceholder } from './MediaPlaceholder';

// Desktop mosaic slots for up to 4 stories: big feature (2×2), two squares, one wide.
const SLOTS = [
  'col-span-2 row-span-2 lg:col-span-2 lg:row-span-2',
  'col-span-1 row-span-1 lg:col-span-1 lg:row-span-1',
  'col-span-1 row-span-1 lg:col-span-1 lg:row-span-1',
  'col-span-2 row-span-1 lg:col-span-2 lg:row-span-1',
];

/**
 * Featured stories as an editorial mosaic (text over photo with a bottom scrim; hover = slow zoom + "View story" slides in).
 * Grid rows are fixed heights, so the block stays compact on every screen.
 */
export function FeaturedMosaic({ albums }: { albums: Album[] }) {
  const items = albums.slice(0, 4);
  return (
    <ul className="grid auto-rows-[9.5rem] grid-cols-2 gap-2 sm:auto-rows-[12rem] sm:gap-4 lg:auto-rows-[14rem] lg:grid-cols-4">
      {items.map((a, i) => {
        const title = albumTitle(a);
        const date = formatShootDate(a.shoot_date);
        const big = i === 0;
        return (
          <li key={a.id} className={`reveal ${SLOTS[i]}`}>
            <Link
              href={albumHref(a)}
              className="group relative block h-full overflow-hidden rounded-2xl bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              {a.cover_image_url ? (
                <Image
                  src={a.cover_image_url}
                  alt={`${title}${a.category ? ` — ${a.category.name}` : ''} by Wandering Kite`}
                  fill
                  sizes={big ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                  className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] motion-reduce:transition-none"
                />
              ) : (
                <MediaPlaceholder className="absolute inset-0" />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className={`absolute inset-x-0 bottom-0 ${big ? 'p-4 sm:p-6 lg:p-8' : 'p-4'}`}>
                {a.category && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 sm:text-[11px]">{a.category.name}</p>
                )}
                <h3 className={`mt-1 font-semibold leading-snug text-white ${big ? 'text-xl sm:text-2xl lg:text-3xl' : 'line-clamp-2 text-sm sm:text-base'}`}>{title}</h3>
                {big && (a.city || date) && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-white/80 sm:text-sm">
                    {a.city && <><MapPin className="h-3.5 w-3.5" aria-hidden />{a.city.name}</>}
                    {a.city && date && <span aria-hidden>·</span>}
                    {date}
                  </p>
                )}
                {/* Revealed on hover (desktop); always visible on the feature tile. */}
                <span
                  className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                    big ? '' : 'lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100'
                  } ${big ? '' : 'hidden lg:inline-flex'}`}
                >
                  View story <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
