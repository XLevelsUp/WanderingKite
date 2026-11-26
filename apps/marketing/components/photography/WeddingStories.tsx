import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Camera, Clock, Film, MapPin } from 'lucide-react';
import { albumHref, albumTitle, formatShootDate, type Album } from '@/lib/photography/data';
import { storySerif } from '@/lib/fonts';
import { MediaPlaceholder } from './MediaPlaceholder';
import { CountUp } from './CountUp';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** Big-number strip. Every figure comes from the catalog or the site's stated 7–10 day delivery — nothing invented. */
export function WeddingStats({ wrap, albums, categories, cities }: { wrap: string; albums: number; categories: number; cities: number }) {
  const stats: { n: number; prefix?: string; unit?: string; label: string }[] = [
    { n: albums, label: albums === 1 ? 'Story published' : 'Stories published' },
    { n: categories, label: 'Categories we cover' },
    { n: cities, label: cities === 1 ? 'City served' : 'Cities served' },
    { n: 10, prefix: '7–', unit: ' days', label: 'Edited photos delivered' },
  ];
  return (
    <section aria-label="Wandering Kite in numbers" className="border-b border-border">
      <dl className={`${wrap} grid grid-cols-2 gap-y-8 py-12 sm:py-16 lg:grid-cols-4`}>
        {stats.map((s, i) => (
          <div key={s.label} data-reveal style={d(i * 120)} className={`px-4 text-center ${i % 2 ? 'border-l border-border' : ''} ${i > 0 ? 'lg:border-l lg:border-border' : ''}`}>
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span className={`${storySerif.className} block text-5xl font-semibold leading-none text-foreground lining-nums tabular-nums sm:text-6xl`}>
                {s.prefix && <span className="text-accent-bright">{s.prefix}</span>}
                <CountUp to={s.n} />
                {s.unit && <span className="ml-1 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-foreground/60">{s.unit.trim()}</span>}
              </span>
              <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">{s.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Recent stories: large landscape photo cards, story names set in a serif over the photo; meta + pill rise on hover. */
export function StoryGrid({ wrap, albums, total }: { wrap: string; albums: Album[]; total: number }) {
  if (!albums.length) return null;
  return (
    <section aria-labelledby="latest-heading">
      <div className={`${wrap} py-16 sm:py-20 lg:py-24`}>
        <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Latest</p>
            <h2 id="latest-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Recent stories</h2>
          </div>
          {total > albums.length && (
            <a href="#categories" className="text-sm font-semibold text-foreground underline decoration-accent-text decoration-2 underline-offset-8 transition-colors hover:text-accent-text">
              Browse all {total} stories
            </a>
          )}
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {albums.map((a, i) => {
            const title = albumTitle(a);
            const meta = [a.category?.name, a.city?.name, formatShootDate(a.shoot_date)].filter(Boolean).join(' · ');
            return (
              <li key={a.id} data-reveal="frame" style={d((i % 3) * 140)}>
                <Link
                  href={albumHref(a)}
                  className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
                >
                  <div className="frame-media relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    {a.cover_image_url ? (
                      <Image
                        src={a.cover_image_url}
                        alt={`${title}${a.category ? ` — ${a.category.name}` : ''} photography by Wandering Kite`}
                        fill
                        priority={i < 3}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] motion-reduce:transition-none"
                      />
                    ) : (
                      <MediaPlaceholder className="absolute inset-0" label="Cover coming soon" />
                    )}
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
                    <span
                      aria-hidden
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <h3 className={`${storySerif.className} text-[1.75rem] font-medium leading-[1.1] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-3xl lg:group-hover:-translate-y-1`}>
                        {title}
                      </h3>
                      {meta && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition-[opacity,transform] duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                          {meta}
                        </p>
                      )}
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

// "Why choose us" — every point is existing site copy (Our Approach + the weddings films line).
const WHY = [
  { icon: Camera, title: 'Authentic Storytelling', body: 'We photograph what actually happens — the glance before the thaali, the laugh after the rituals, the quiet in between. Whether it is your wedding or a portrait session, the photos should feel the way the day felt.' },
  { icon: Clock, title: 'Reliable Quality', body: 'Professionally edited photos reach you within 7–10 days. Your quote lists exactly what is included before you pay an advance, so there are no surprises later.' },
  { icon: MapPin, title: 'Regional Coverage', body: 'From our studio in RS Puram, Coimbatore, we photograph weddings, events, portraits and commercial work across Tiruppur, Salem, Erode and further when you need us.' },
  { icon: Film, title: 'Wedding films', body: 'Cinematic highlights and full-length films, cut to your music and your story.' },
];

/** Why choose us: framed photo (house motif) left, four numbered reasons right; phones stack. */
export function WhyChooseUs({ wrap, cover }: { wrap: string; cover: string | null }) {
  return (
    <section aria-labelledby="why-heading" data-tone="white">
      <div className={`${wrap} grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-24`}>
        <div className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-[26rem]">
            <div aria-hidden data-reveal="offset" style={d(250)} className="absolute -bottom-4 -right-4 left-4 top-4 rounded-2xl bg-[#CBB9A4]" />
            <div data-reveal="frame" className="relative rounded-2xl bg-[#FAF9F6] p-3 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)]">
              <div className="frame-media relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                {cover ? (
                  <Image src={cover} alt="" fill sizes="26rem" className="object-cover" />
                ) : (
                  <MediaPlaceholder className="absolute inset-0" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div data-reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Why us</p>
            <h2 id="why-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why choose Wandering Kite</h2>
          </div>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:mt-12">
            {WHY.map((w, i) => (
              <li key={w.title} data-reveal style={d(150 + i * 120)} className="group">
                <div className="flex items-center gap-4">
                  <span className="pm-num h-11 w-11 text-xs">{String(i + 1).padStart(2, '0')}</span>
                  <w.icon className="h-5 w-5 text-accent-text transition-transform duration-500 group-hover:-rotate-12" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{w.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-foreground/75">{w.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
