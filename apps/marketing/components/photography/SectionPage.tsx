import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { AlbumGrid } from './AlbumGrid';
import { PhotoMotion } from './PhotoMotion';
import { SectionSubNav } from './SectionSubNav';
import { StoryGrid, WeddingStats, WhyChooseUs } from './WeddingStories';
import { MediaPlaceholder } from './MediaPlaceholder';
import { VideoSlot } from './VideoSlot';
import { BookingBand, Breadcrumbs, CitiesBand, PHOTO_WRAP, categoryHeading } from './PhotoChrome';
import { albumHref, albumTitle, formatShootDate, categoryHref, getAlbums, getCatalog, getSectionOverview, sectionTree, type Album, type Section } from '@/lib/photography/data';

// Per-section copy. Second headline line is orange (house rule: orange for second lines only).
const COPY: Record<string, {
  h1: string; h1b: string; lead: string; films: string; filmsLead: string;
  groups: Record<string, string>; book: { title: string; subtitle: string; message: string };
}> = {
  weddings: {
    h1: 'Wedding & event photography',
    h1b: 'that feels like the day felt.',
    lead: 'Candid, story-led coverage of weddings, baby milestones and family celebrations — from the first ritual to the last dance. Based in Coimbatore, travelling across Tamil Nadu and Bangalore.',
    films: 'Wedding films',
    filmsLead: 'Cinematic highlights and full-length films, cut to your music and your story.',
    groups: { wedding: 'Weddings by tradition', baby: 'Baby & maternity', gallery: 'Portraits & outdoor', events: 'Family events' },
    book: {
      title: 'Your date, your story — let’s plan it.',
      subtitle: 'Share the date, venue and city. We’ll confirm availability and send packages within the day.',
      message: "Hi! I'd like to check availability for a wedding/event shoot.",
    },
  },
  corporate: {
    h1: 'Corporate photography & production',
    h1b: 'built for your brand.',
    lead: 'Events, conferences, headshots, product shoots, ads, music videos and short films — planned around your brief, shot to your brand guidelines and delivered ready to publish.',
    films: 'Brand films',
    filmsLead: 'Ads, music videos and short films — concept, shoot and edit under one roof.',
    groups: { corporate: 'What we shoot' },
    book: {
      title: 'Have a brief? Let’s scope it.',
      subtitle: 'Tell us the deliverables, timeline and location — we’ll come back with a plan and a quote.',
      message: "Hi! I'd like a quote for a corporate shoot.",
    },
  },
};

const tone = (corporate: boolean, t: 'sandstone' | 'sand' | 'white') => (corporate ? t : undefined);

/**
 * Hero picture: ONE portrait photo in the house frame (porcelain mat + offset sandstone block) with a slow settle-zoom,
 * and a "Latest story" card overlapping its lower-left corner (real album name, place, date → links to it).
 */
function HeroFrame({ album }: { album: Album | undefined }) {
  const meta = album ? [album.city?.name, formatShootDate(album.shoot_date)].filter(Boolean).join(' · ') : '';
  return (
    <div className="relative mx-auto w-full max-w-[22rem] pb-10 sm:max-w-[26rem] lg:mr-0 lg:max-w-[min(100%,calc(min(72svh,40rem)*4/5))] lg:pl-10">
      <div className="relative">
        <div aria-hidden data-reveal="offset" style={{ '--d': '300ms' } as CSSProperties} className="absolute -bottom-4 -right-4 left-4 top-4 rounded-2xl bg-[#CBB9A4] sm:-bottom-5 sm:-right-5 sm:left-5 sm:top-5 [[data-tone=sandstone]_&]:bg-[#FAF9F6]/45" />
        <div className="relative rounded-2xl bg-[#FAF9F6] p-2.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)] sm:p-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
            {album?.cover_image_url ? (
              <Image src={album.cover_image_url} alt={`${albumTitle(album)} photography by Wandering Kite`} fill priority sizes="(min-width: 1024px) 34vw, 90vw" className="kenburns object-cover" />
            ) : (
              <MediaPlaceholder className="absolute inset-0" />
            )}
          </div>
        </div>
      </div>
      {album && (
        <Link
          href={albumHref(album)}
          data-reveal
          style={{ '--d': '500ms' } as CSSProperties}
          className="group absolute bottom-0 left-0 z-10 flex w-[85%] max-w-[18rem] items-center gap-4 rounded-2xl border border-border bg-[#FAF9F6]/95 p-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-text">Latest story</span>
            <span className="mt-1 block truncate text-base font-semibold text-foreground">{albumTitle(album)}</span>
            {meta && <span className="block truncate text-xs text-foreground/65">{meta}</span>}
          </span>
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      )}
    </div>
  );
}

export async function SectionPage({ section }: { section: Section }) {
  const corporate = section.slug === 'corporate';
  const copy = COPY[section.slug] ?? COPY.weddings;
  const [cat, overview, latest, featured] = await Promise.all([
    getCatalog(),
    getSectionOverview(section.slug),
    getAlbums({ section: section.slug, pageSize: corporate ? 6 : 9 }),
    getAlbums({ section: section.slug, featured: true, pageSize: 3 }),
  ]);
  const tree = sectionTree(cat, section.slug);
  // Collage: featured albums first, topped up with the newest.
  const hero = [...featured.albums, ...latest.albums.filter((a) => !featured.albums.some((f) => f.id === a.id))].slice(0, 3);
  const totalCats = tree.reduce((n, g) => n + g.categories.length, 0);

  return (
    <>
      <main>
        <PhotoMotion />
        <SectionSubNav
          sectionName={section.name}
          sectionHref={`/photography/${section.slug}`}
          bookHref={generateWhatsAppLink('photography', copy.book.message)}
          groups={tree.map((g) => ({ slug: g.slug, name: g.name, categories: g.categories.map((c) => ({ id: c.id, name: c.name, href: categoryHref(c), subgroup: c.subgroup ?? null, count: overview[c.id]?.count ?? 0 })) }))}
        />
        {/* ── Hero ── */}
        <section data-tone={tone(corporate, 'sandstone')} className="overflow-hidden border-b border-border">
          <div className={`${PHOTO_WRAP} grid gap-8 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-20 lg:pt-16`}>
            <div className="lg:col-span-6">
              <Breadcrumbs items={[{ label: 'Photography', href: '/photography' }, { label: section.name }]} />
              <h1 className="mt-8 max-w-[18ch] text-3xl font-bold leading-[1.2] tracking-[-0.01em] text-foreground [word-spacing:0.06em] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.18]">
                {copy.h1}
                <span className="mt-2 block text-accent-text">{copy.h1b}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-[1.75] text-foreground/80">{copy.lead}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href={generateWhatsAppLink('photography', copy.book.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Check your date
                </a>
                <a
                  href="#categories"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/30 px-6 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Browse albums
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
              {/* Real numbers from the catalog — no invented stats. Weddings shows them as the big strip below instead. */}
              {corporate && <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-foreground/15 pt-6">
                {[
                  [latest.total, latest.total === 1 ? 'album' : 'albums'],
                  [totalCats, 'categories'],
                  [cat.cities.length, 'cities'],
                ].map(([n, l]) => (
                  <div key={String(l)}>
                    <dt className="sr-only">{l}</dt>
                    <dd className="text-sm text-foreground/70">
                      <span className="mr-1 text-2xl font-bold tabular-nums text-foreground">{n}</span>
                      {l}
                    </dd>
                  </div>
                ))}
              </dl>}
            </div>
            <div className="lg:col-span-6">
              <HeroFrame album={hero[0]} />
            </div>
          </div>
        </section>

        {!corporate && (
          <>
            <WeddingStats wrap={PHOTO_WRAP} albums={latest.total} categories={totalCats} cities={cat.cities.length} />
            <StoryGrid wrap={PHOTO_WRAP} albums={latest.albums} total={latest.total} />
            <WhyChooseUs wrap={PHOTO_WRAP} cover={(latest.albums[3] ?? latest.albums[0])?.cover_image_url ?? null} />
          </>
        )}

        {/* ── Category tiles, one block per group ── */}
        <section id="categories" data-tone={tone(corporate, 'sand')} aria-label={`${section.name} categories`} className="scroll-mt-20">
          <div className={`${PHOTO_WRAP} space-y-16 py-16 sm:py-20 lg:space-y-20 lg:py-24`}>
            {tree.map((g) => (
              <div key={g.slug}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">{g.name}</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{copy.groups[g.slug] ?? g.name}</h2>
                  </div>
                </div>
                <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:mt-12 lg:grid-cols-4 lg:gap-6">
                  {g.categories.map((c) => {
                    const st = overview[c.id];
                    // With a photo: white text over a dark scrim. Without: dark text on the light frame (a scrim over a placeholder looks muddy).
                    const pic = !!st?.cover;
                    return (
                      <li key={c.id} className="reveal">
                        <Link
                          href={categoryHref(c)}
                          className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                        >
                          {st?.cover ? (
                            <Image src={st.cover} alt={`${categoryHeading(c)} by Wandering Kite`} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 31vw, 48vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] motion-reduce:transition-none" />
                          ) : (
                            <MediaPlaceholder className="absolute inset-0" corners={false} />
                          )}
                          {pic && <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />}
                          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-6">
                            <div className="min-w-0">
                              {c.subgroup && <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${pic ? 'text-white/70' : 'text-foreground/60'}`}>{c.subgroup}</p>}
                              <h3 className={`text-base font-semibold leading-snug sm:text-lg ${pic ? 'text-white' : 'text-foreground'}`}>{c.name}</h3>
                              <p className={`mt-1 text-xs ${pic ? 'text-white/75' : 'text-foreground/60'}`}>{st?.count ? `${st.count} ${st.count === 1 ? 'album' : 'albums'}` : 'Coming soon'}</p>
                            </div>
                            <span aria-hidden className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full backdrop-blur-sm transition-[transform,background-color,color] duration-300 group-hover:translate-x-0.5 sm:flex ${pic ? 'bg-white/15 text-white group-hover:bg-white group-hover:text-black' : 'border border-foreground/20 bg-background/70 text-foreground group-hover:bg-cta group-hover:text-cta-foreground'}`}>
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Latest albums (corporate; weddings shows StoryGrid above) ── */}
        {corporate && <section aria-labelledby="latest-heading" className="border-t border-border">
          <div className={`${PHOTO_WRAP} py-16 sm:py-20 lg:py-24`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Latest</p>
            <h2 id="latest-heading" className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Recent stories</h2>
            <div className="mt-8 lg:mt-12">
              <AlbumGrid albums={latest.albums} />
            </div>
          </div>
        </section>}

        <div data-tone={tone(corporate, 'white')}>
          {/* ── Films (video placeholder until a film URL is added) ── */}
          <section aria-labelledby="films-heading" className="border-t border-border">
            <div className={`${PHOTO_WRAP} grid gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-24`}>
              <div className="lg:col-span-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Films</p>
                <h2 id="films-heading" className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{copy.films}</h2>
                <p className="mt-4 text-base leading-relaxed text-foreground/80">{copy.filmsLead}</p>
              </div>
              <div className="reveal lg:col-span-8">
                <VideoSlot className="aspect-video rounded-2xl" label={`${copy.films} coming soon`} />
              </div>
            </div>
          </section>

          <CitiesBand cities={cat.cities} />

          <BookingBand title={copy.book.title} subtitle={copy.book.subtitle} message={copy.book.message} />
        </div>
      </main>
      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}
