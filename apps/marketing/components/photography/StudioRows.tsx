import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MediaPlaceholder } from './MediaPlaceholder';
import { PHOTO_WRAP } from './PhotoChrome';
import { categoryHref, getCatalog, getSectionOverview, sectionTree, type Category } from '@/lib/photography/data';

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

// Film-strip sprocket holes: a row of small rounded light bars (pure CSS gradient, no images).
const SPROCKETS = 'absolute inset-x-3 h-2 rounded-sm [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.55)_0_10px,transparent_10px_22px)]';

/**
 * Photography hub "Explore": one contact-sheet band per section. Left: number, title, group links, CTA.
 * Right: a film strip of 4 category frames (newest cover from the DB, placeholder if none; categories with photos first).
 * Weddings band = porcelain + dark CTA; Corporate band = sandstone + white CTA (data-tone).
 */
export async function StudioRows() {
  const cat = await getCatalog();
  const bands = await Promise.all(
    cat.sections.map(async (s) => {
      const overview = await getSectionOverview(s.slug);
      const tree = sectionTree(cat, s.slug);
      // Menu order across groups, then prefer categories that already have photos.
      const ordered: Category[] = tree.flatMap((g) => g.categories);
      const frames = [...ordered.filter((c) => overview[c.id]?.cover), ...ordered.filter((c) => !overview[c.id]?.cover)].slice(0, 4);
      return { s, tree, frames, overview };
    })
  );

  return (
    <section id="explore" aria-labelledby="explore-heading" className="scroll-mt-20">
      <div className={`${PHOTO_WRAP} pt-16 sm:pt-20 lg:pt-24`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Explore</p>
        <h2 id="explore-heading" className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Two studios, one eye for the moment</h2>
      </div>

      <div>
        {bands.map(({ s, tree, frames, overview }, i) => {
          const c = COPY[s.slug] ?? { n: '', eyebrow: '', body: '', cta: `Explore ${s.name.toLowerCase()}` };
          const corporate = s.slug === 'corporate';
          // First band sits one block gap (32/48) under the heading — no divider, no extra top padding.
          const first = i === 0;
          return (
            <div key={s.slug} data-tone={corporate ? 'sandstone' : undefined} className={first ? '' : 'border-t border-border'}>
              <div className={`${PHOTO_WRAP} grid gap-8 pb-12 sm:pb-16 lg:grid-cols-12 lg:items-center lg:gap-16 ${first ? 'pt-8 lg:pt-12' : 'pt-12 sm:pt-16'}`}>
                {/* ── Copy ── */}
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4">
                    <span className="pm-num h-10 w-10 self-center text-xs">{c.n}</span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/60">{c.eyebrow}</p>
                  </div>
                  <h3 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">{s.name}</h3>
                  <p className="mt-4 text-base leading-relaxed text-foreground/80">{c.body}</p>
                  {tree.length > 1 && (
                    <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium" aria-label={`${s.name} groups`}>
                      {tree.map((g) =>
                        g.categories[0] ? (
                          <li key={g.slug}>
                            <Link href={categoryHref(g.categories[0])} className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground">
                              {g.name}
                            </Link>
                          </li>
                        ) : null
                      )}
                    </ul>
                  )}
                  <Link
                    href={`/photography/${s.slug}`}
                    className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {c.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>

                {/* ── Film strip of category frames ── */}
                <div className="reveal lg:col-span-8">
                  <div className="relative rounded-xl bg-[#121010] px-3 py-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]">
                    <span aria-hidden className={`${SPROCKETS} top-2.5`} />
                    <span aria-hidden className={`${SPROCKETS} bottom-2.5`} />
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {frames.map((f, i) => {
                        const st = overview[f.id];
                        return (
                          <li key={f.id}>
                            <Link href={categoryHref(f)} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#1d1a18]">
                                {st?.cover ? (
                                  <Image
                                    src={st.cover}
                                    alt={`${f.name} by Wandering Kite`}
                                    fill
                                    sizes="(min-width: 1024px) 15vw, (min-width: 640px) 24vw, 46vw"
                                    className="object-cover opacity-90 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] group-hover:opacity-100 motion-reduce:transition-none"
                                  />
                                ) : (
                                  <div data-theme="studio" className="absolute inset-0">
                                    <MediaPlaceholder className="absolute inset-0" corners={false} />
                                  </div>
                                )}
                              </div>
                              {/* Negative-style frame label. */}
                              <p className="mt-2 flex items-baseline gap-2 px-0.5">
                                <span className="font-mono text-[10px] font-semibold tracking-[0.15em] text-[#FF5500]">
                                  {String(i + 1).padStart(2, '0')}A
                                </span>
                                <span className="truncate text-xs font-medium text-white/85 transition-colors group-hover:text-white">{f.name}</span>
                              </p>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
