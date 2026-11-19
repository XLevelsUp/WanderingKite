'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MediaPlaceholder } from './MediaPlaceholder';

export interface StoryItem {
  id: string | number;
  href: string;
  title: string;
  cover: string | null;
  alt: string;
  meta: string;
}

/**
 * lg: framed preview (porcelain mat + sandstone offset) beside a numbered index; hovering or focusing a title
 * cross-fades the preview to that story with a slow settle-zoom. Below lg: rows with a 4:5 thumbnail.
 * Row classNames stay static (data-reveal relies on PhotoMotion's .is-in, which a className rewrite would strip).
 */
export function StoryIndex({ items }: { items: StoryItem[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-12 lg:items-center lg:gap-16">
      {/* ── Preview (lg only) ── */}
      <div className="hidden lg:col-span-5 lg:block">
        <div className="relative mx-auto w-full max-w-[28rem]">
          <div aria-hidden data-reveal="offset" style={{ '--d': '250ms' } as CSSProperties} className="absolute -bottom-4 -right-4 left-4 top-4 rounded-2xl bg-[#CBB9A4]" />
          <div data-reveal="frame" className="relative rounded-2xl bg-[#FAF9F6] p-3 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)]">
            <div className="frame-media relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
              {items.map((it, i) => (
                <div
                  key={it.id}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${i === active ? 'scale-100 opacity-100' : 'scale-[1.06] opacity-0'}`}
                >
                  {it.cover ? (
                    <Image src={it.cover} alt={i === active ? it.alt : ''} fill sizes="28rem" className="object-cover" />
                  ) : (
                    <MediaPlaceholder className="absolute inset-0" label="Story cover" />
                  )}
                </div>
              ))}
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[11px] font-semibold tracking-[0.15em] text-white">
                <span>{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
                <span key={active} className="truncate pl-4 text-white/80 motion-safe:animate-[blog-card-in_420ms_cubic-bezier(0.16,1,0.3,1)_both]">{current.title}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Index ── */}
      <ol className="border-b border-border lg:col-span-7">
        {items.map((it, i) => {
          const on = i === active;
          return (
            <li key={it.id} data-reveal style={{ '--d': `${i * 110}ms` } as CSSProperties} className="relative">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-border" />
              <span aria-hidden className={`absolute left-0 top-0 hidden h-px w-full origin-left bg-gradient-to-r from-[#CBB9A4] via-primary to-primary-deep transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] lg:block ${on ? 'scale-x-100' : 'scale-x-0'}`} />
              <Link
                href={it.href}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group grid grid-cols-[5rem_1fr_auto] items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[6rem_1fr_auto] sm:gap-6 lg:grid-cols-[3.5rem_1fr_auto] lg:py-8"
              >
                {/* Phone/tablet thumbnail; on lg this cell becomes the index number. */}
                <span className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted lg:hidden">
                  {it.cover ? (
                    <Image src={it.cover} alt="" fill sizes="6rem" className="object-cover" />
                  ) : (
                    <MediaPlaceholder className="absolute inset-0" corners={false} />
                  )}
                </span>
                <span className={`pm-num hidden h-10 w-10 text-[11px] lg:inline-flex ${on ? '' : 'is-off'}`}>{String(i + 1).padStart(2, '0')}</span>

                <span className="min-w-0">
                  <span className="pm-num mb-1 h-6 w-6 text-[10px] lg:hidden">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`block text-lg font-semibold leading-snug text-foreground transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-xl lg:text-2xl ${on ? 'lg:translate-x-2' : 'lg:opacity-50 lg:group-hover:opacity-100'}`}>
                    {it.title}
                  </span>
                  {it.meta && <span className="mt-1 block truncate text-sm text-foreground/65">{it.meta}</span>}
                </span>

                <span
                  aria-hidden
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ${on ? 'lg:rotate-45 lg:border-primary lg:bg-primary lg:text-primary-foreground' : 'border-border text-foreground'}`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
