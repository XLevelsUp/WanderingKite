'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Homepage "Selected Work": the two photography sections as an editorial index, each with its film (16:9, never cropped).
const ROWS = [
  {
    n: '01',
    href: '/photography/weddings',
    eyebrow: 'For families & celebrations',
    title: 'Weddings & Events',
    body: 'Weddings by tradition, baby & maternity, portraits, outdoor shoots and family celebrations.',
    tags: ['Weddings', 'Engagement', 'Reception', 'Baby & Maternity', 'Pre & Post-wedding', 'Family Events'],
    film: '/videos/events-film.webm',
    poster: '/images/photography/events-film-poster.webp',
    label: 'Family celebration film',
  },
  {
    n: '02',
    href: '/photography/corporate',
    eyebrow: 'For brands & businesses',
    title: 'Corporate',
    body: 'Events, conferences, headshots, product shoots, ads, music videos and short films.',
    tags: ['Corporate Events', 'Conferences', 'Headshots', 'Product', 'Ads', 'Music Videos', 'Short Films'],
    film: '/videos/corporate-film.webm',
    poster: '/images/photography/corporate-film-poster.webp',
    label: 'Corporate event film',
  },
];

/**
 * Muted looping film that plays only when `active` AND on screen; otherwise paused.
 * preload="none" + poster: nothing downloads until it first plays (the corporate film is large).
 * Hidden (display:none) copies never intersect, so they never load. Reduced motion: poster only.
 */
function Film({ src, poster, label, active, className = '' }: { src: string; poster: string; label: string; active: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (active && visible && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [active, visible]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={`h-full w-full bg-black object-contain ${className}`}
    >
      <track kind="captions" src="data:text/vtt," srcLang="en" label="No captions" />
    </video>
  );
}

/**
 * Editorial index (distinct from the photo-card style used by Services above):
 * numbered rows on the left; on desktop one framed 16:9 film on the right crossfades to the hovered/focused row.
 * Phones/tablets have no hover, so each row carries its own film. Opacity/transform transitions only.
 */
export function PhotographyDiptych() {
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="work-heading" className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24 lg:pt-8 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-text sm:text-xs">Portfolio</p>
            <h2 id="work-heading" className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
              Selected Work
            </h2>
          </div>
          <Link
            href="/photography"
            className="group inline-flex h-11 shrink-0 items-center gap-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:text-accent-text"
          >
            Explore Photography
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* ── Index rows ── */}
          <ol className="border-b border-border lg:col-span-6">
            {ROWS.map((r, i) => {
              const on = active === i;
              return (
                <li key={r.n} className="border-t border-border">
                  <Link
                    href={r.href}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group block py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background lg:py-10"
                  >
                    {/* Phones/tablets: the row's own film (plays while on screen). */}
                    <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-black lg:hidden">
                      <Film src={r.film} poster={r.poster} label={r.label} active className="absolute inset-0" />
                    </div>

                    <div className="flex items-start gap-4 sm:gap-8">
                      <span className={`pt-2 font-mono text-sm font-semibold tabular-nums transition-colors duration-300 ${on ? 'text-accent-text' : 'text-accent-text/40'} lg:pt-3`}>
                        {r.n}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">{r.eyebrow}</p>
                        <h3
                          className={`mt-2 flex items-center gap-4 text-3xl font-bold tracking-[-0.02em] text-foreground transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-4xl motion-reduce:transition-none ${on ? 'lg:translate-x-2' : ''}`}
                        >
                          {r.title}
                          <ArrowRight
                            aria-hidden
                            className={`h-6 w-6 shrink-0 text-accent-text transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${on ? 'opacity-100' : 'lg:-translate-x-2 lg:opacity-0'}`}
                          />
                        </h3>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/80">{r.body}</p>
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${r.title} includes`}>
                          {r.tags.map((t) => (
                            <li key={t} className={`rounded-full border px-3 py-1 text-xs transition-colors duration-300 ${on ? 'border-accent-text/50 bg-accent-text/5 text-foreground' : 'border-border text-foreground/70'}`}>
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>

          {/* ── Desktop: one framed 16:9 film that crossfades to the active row (porcelain mat + sandstone block). ── */}
          <div className="hidden lg:col-span-6 lg:block">
            {/* Sandstone block is scoped to the frame wrapper so it never runs under the caption. */}
            <div className="relative">
              <div aria-hidden className="absolute -bottom-4 -right-4 left-4 top-4 rounded-2xl bg-[#CBB9A4]" />
              <div className="relative rounded-2xl bg-[#FAF9F6] p-3 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                  {ROWS.map((r, i) => (
                    <div
                      key={r.n}
                      aria-hidden={active !== i}
                      className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${active === i ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <Film src={r.film} poster={r.poster} label={r.label} active={active === i} />
                    </div>
                  ))}
                  <span aria-hidden className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 font-mono text-xs font-semibold tracking-[0.2em] text-white backdrop-blur-sm">
                    <span className="text-[#FF8A4C]">{ROWS[active].n}</span> / {String(ROWS.length).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60"><span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-text motion-safe:animate-pulse" />{ROWS[active].label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
