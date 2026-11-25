import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { albumHref, albumTitle, formatShootDate, type Album } from '@/lib/photography/data';
import { StoryIndex, type StoryItem } from './StoryIndex';

/**
 * Featured Stories as a story index: lg — numbered title list right, a framed preview left that changes with the
 * hovered/focused title. Phones — rows with a small thumbnail. Data shaping happens here (server), interaction in StoryIndex.
 */
export function FeaturedStories({ albums, wrap }: { albums: Album[]; wrap: string }) {
  const items: StoryItem[] = albums.slice(0, 4).map((a) => {
    const title = albumTitle(a);
    return {
      id: a.id,
      href: albumHref(a),
      title,
      cover: a.cover_image_url ?? null,
      alt: `${title}${a.category ? ` — ${a.category.name}` : ''} photography by Wandering Kite`,
      meta: [a.category?.name, a.city?.name, formatShootDate(a.shoot_date)].filter(Boolean).join(' · '),
    };
  });
  if (!items.length) return null;

  return (
    <section aria-labelledby="stories-heading" data-tone="white">
      <div className={`${wrap} pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24`}>
        <div data-reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Portfolio</p>
            <h2 id="stories-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Featured Stories</h2>
          </div>
          <Link
            href="/photography/weddings"
            className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-foreground sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
              All Weddings &amp; Events
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <StoryIndex items={items} />
      </div>
    </section>
  );
}
