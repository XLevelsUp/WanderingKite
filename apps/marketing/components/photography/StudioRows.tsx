import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MediaPlaceholder } from './MediaPlaceholder';
import { NearImage } from './NearImage';
import { PHOTO_WRAP } from './PhotoChrome';
import { storySerif } from '@/lib/fonts';
import { getCatalog, getSectionOverview, sectionTree, type Category } from '@/lib/photography/data';

const COPY: Record<string, { n: string; eyebrow: string; body: string; cta: string }> = {
  weddings: {
    n: '01',
    eyebrow: 'For families & celebrations',
    body: 'Weddings by tradition, baby & maternity, portraits, outdoor shoots and family celebrations.',
    cta: 'Explore weddings & events',
  },
  corporate: {
    n: '02',
    eyebrow: 'For brands & businesses',
    body: 'Events, conferences, headshots, product shoots, ads, music videos and short films.',
    cta: 'Explore corporate',
  },
};

// Book look per section: weddings = porcelain cloth with a taupe spine; corporate = deep charcoal with a sandstone spine.
const BOOK: Record<string, { spine: string; edge: string }> = {
  weddings: { spine: 'bg-[#7A6453]', edge: 'from-[#F4F1EA]' }, // spine a shade deeper than #8B7462 so its white label passes 4.5:1
  corporate: { spine: 'bg-[#2B2522]', edge: 'from-[#E8E0D4]' },
};

/**
 * Photography hub "Explore" as two hardcover photo ALBUMS — each one is a single link to its section page.
 * The metaphor says "there's more inside": desktop hover swings the cover open in 3D (transform only, GPU) to
 * reveal the first page listing what's in the album + "Open album →"; on touch screens the cover rests slightly
 * open so the inside page peeks out. Reduced motion: no swing, the cover stays put.
 */
export async function StudioRows() {
  const cat = await getCatalog();
  const albums = await Promise.all(
    cat.sections.map(async (s) => {
      const overview = await getSectionOverview(s.slug);
      const tree = sectionTree(cat, s.slug);
      const ordered: Category[] = tree.flatMap((g) => g.categories);
      const cover = ordered.map((c) => overview[c.id]?.cover).find(Boolean) ?? null;
      const count = Object.values(overview).reduce((n, st) => n + st.count, 0);
      // What's inside: groups with their category counts (corporate has one group → list its categories instead).
      const contents =
        tree.length > 1
          ? tree.map((g) => ({ name: g.name, n: g.categories.length }))
          : ordered.map((c) => ({ name: c.name, n: overview[c.id]?.count ?? 0 }));
      return { s, cover, count, categories: ordered.length, contents: contents.slice(0, 7) };
    })
  );

  return (
    <section id="explore" aria-labelledby="explore-heading" className="scroll-mt-20 overflow-x-clip">
      <div className={`${PHOTO_WRAP} py-16 sm:py-20 lg:py-24`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Explore</p>
        <h2 id="explore-heading" className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Two studios, one eye for the moment</h2>
        <p className="mt-3 max-w-2xl text-base text-foreground/80">Open an album to see its full page — every category, story and film inside.</p>

        {/* Mobile-first: a swipe row (next album peeks in) below lg; two side-by-side albums on desktop. */}
        <ul className="-mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:mt-12 lg:grid lg:grid-cols-2 lg:gap-12 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {albums.map(({ s, cover, count, categories, contents }, i) => {
            const c = COPY[s.slug] ?? { n: String(i + 1).padStart(2, '0'), eyebrow: '', body: '', cta: `Explore ${s.name.toLowerCase()}` };
            const book = BOOK[s.slug] ?? BOOK.weddings;
            const dark = s.slug === 'corporate';
            return (
              <li key={s.slug} data-reveal style={{ '--d': `${i * 160}ms` } as CSSProperties} className="w-[84%] shrink-0 snap-start sm:w-[58%] lg:w-auto">
                <Link
                  href={`/photography/${s.slug}`}
                  aria-label={`Open the ${s.name} page — ${categories} categories, ${count} ${count === 1 ? 'album' : 'albums'}`}
                  className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-8"
                >
                  {/* ── The album ── */}
                  <div className="relative mx-auto w-full max-w-[34rem] [perspective:1800px]">
                    {/* Floor shadow */}
                    <div aria-hidden className="absolute -bottom-5 left-[8%] right-[2%] hidden h-8 rounded-[50%] bg-black/25 blur-xl lg:block transition-transform duration-700 group-hover:scale-x-105" />

                    <div className="relative aspect-[5/4]">
                      {/* Page block (visible when the cover opens): stacked page edges + the first page. */}
                      {/* Desktop only: on phones the album is a flat cover (no hover to open it). */}
                      <div aria-hidden className="absolute inset-y-[1.5%] left-[3%] right-0 hidden rounded-r-lg bg-[#FBFAF7] lg:block shadow-[inset_8px_0_16px_-10px_rgba(0,0,0,0.35)]">
                        {/* page edges on the right */}
                        <span className={`absolute inset-y-1 -right-1.5 w-2 rounded-r bg-gradient-to-r ${book.edge} to-[#d9d2c6] [background-image:repeating-linear-gradient(90deg,#efe9df_0_1px,#d9d2c6_1px_2px)]`} />
                        {/* Contents sit in the right part of the page, clear of the opened cover. */}
                        <div className="ml-auto flex h-full w-[60%] flex-col justify-between py-[8%] pr-[8%]">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-text">Inside this album</p>
                            <ul className="mt-3 space-y-1.5 sm:mt-4">
                              {contents.map((it) => (
                                <li key={it.name} className="flex items-baseline justify-between gap-3 border-b border-dashed border-black/10 pb-1 text-[13px] text-foreground/80 sm:text-sm">
                                  <span className="truncate">{it.name}</span>
                                  <span className="font-mono text-[11px] tabular-nums text-foreground/50">{String(it.n).padStart(2, '0')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <span className="inline-flex items-center gap-2 self-start text-sm font-semibold text-foreground">
                            Open album
                            <ArrowRight className="h-4 w-4 text-accent-bright transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>

                      {/* Cover: hinged on the left. Flat on phones/tablets; swings open on hover on desktop with a mouse. */}
                      <div
                        className={`absolute inset-0 origin-left transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none lg:[@media(hover:hover)_and_(pointer:fine)]:group-hover:[transform:rotateY(-72deg)] lg:[@media(hover:hover)_and_(pointer:fine)]:group-focus-visible:[transform:rotateY(-72deg)] motion-reduce:![transform:none]`}
                      >
                        <div className="absolute inset-0 overflow-hidden rounded-r-lg rounded-l-sm shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] [backface-visibility:hidden]">
                          {/* Spine */}
                          <div className={`absolute inset-y-0 left-0 z-10 flex w-[11%] items-center justify-center ${book.spine} shadow-[inset_-6px_0_10px_-4px_rgba(0,0,0,0.45)]`}>
                            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.35em] text-white [writing-mode:vertical-rl] rotate-180 sm:text-[11px]">
                              {s.name} · {c.n}
                            </span>
                          </div>
                          {/* Cover photo */}
                          <div className="absolute inset-y-0 left-[11%] right-0 bg-muted">
                            {cover ? (
                              <NearImage src={cover} alt={`${s.name} photography by Wandering Kite`} className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                              <MediaPlaceholder className="absolute inset-0" corners={false} />
                            )}
                            <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-t from-black/85 via-black/35 to-black/10' : 'bg-gradient-to-t from-black/75 via-black/20 to-transparent'}`} />
                            {/* Hinge highlight: a soft crease next to the spine */}
                            <span className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 to-transparent" />
                            {/* Phones/tablets: visible "Open album" cue on the cover (desktop reveals it by opening the book). */}
                            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-black shadow-md backdrop-blur-sm lg:hidden">
                              Open album
                              <ArrowRight className="h-3.5 w-3.5 text-accent-bright" aria-hidden />
                            </span>
                            {/* Embossed title block */}
                            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
                              <span className="inline-block rounded-sm border border-white/50 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.25em] text-white/85">ALBUM {c.n}</span>
                              <p className={`${storySerif.className} mt-2 text-3xl font-semibold leading-[1.05] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-5xl`}>{s.name}</p>
                              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">{c.eyebrow}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Caption under the album ── */}
                  <div className="mx-auto mt-4 w-full max-w-[34rem] lg:mt-10">
                    <p className="line-clamp-2 text-base leading-relaxed text-foreground/80 lg:line-clamp-none">{c.body}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 lg:mt-4">
                      <span className="text-sm font-semibold text-foreground">
                        {categories} categories <span className="text-foreground/40">·</span> {count} {count === 1 ? 'album' : 'albums'}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-accent-bright decoration-2 underline-offset-[6px] transition-colors group-hover:text-accent-text">
                        {c.cta}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
