'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, MessageCircle } from 'lucide-react';

export interface SubNavCategory { id: string; name: string; href: string; subgroup: string | null; count?: number }
export interface SubNavGroup { slug: string; name: string; categories: SubNavCategory[] }

/**
 * Sticky category sub-header under the fixed 80px main nav (section + category pages).
 * Groups sit in a row (scrolls sideways on phones); hovering (desktop) or tapping a group opens a full-width panel
 * of its categories, split by subgroup. The current category/group is marked in orange. Escape / outside click closes.
 */
export function SectionSubNav({
  sectionName,
  sectionHref,
  groups,
  activeId,
  bookHref,
}: {
  sectionName: string;
  sectionHref: string;
  groups: SubNavGroup[];
  activeId?: string;
  bookHref: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const activeGroup = groups.find((g) => g.categories.some((c) => c.id === activeId))?.slug;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(null);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // Hover intent for mouse users only; touch uses click.
  const hoverOpen = (slug: string) => (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(closeTimer.current);
    setOpen(slug);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    closeTimer.current = window.setTimeout(() => setOpen(null), 180);
  };

  const panel = groups.find((g) => g.slug === open);
  // Split the open group's categories by subgroup (categories without one share a single unnamed column).
  const columns = panel
    ? Object.entries(
        panel.categories.reduce<Record<string, SubNavCategory[]>>((acc, c) => {
          (acc[c.subgroup ?? ''] ??= []).push(c);
          return acc;
        }, {})
      )
    : [];

  return (
    <div ref={root} className="sticky top-20 z-30 mt-20 border-b border-border bg-[#FAF9F6]/90 backdrop-blur-md" onPointerLeave={hoverClose} onPointerEnter={() => window.clearTimeout(closeTimer.current)}>
      <nav aria-label={`${sectionName} categories`} className="mx-auto flex h-12 w-full max-w-7xl items-center gap-3 px-5 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        <Link href={sectionHref} className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-text sm:block">
          {sectionName}
        </Link>
        <span aria-hidden className="hidden h-5 w-px shrink-0 bg-border sm:block" />

        <ul className="-mx-2 flex min-w-0 flex-1 items-center overflow-x-auto pr-6 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* One group (e.g. Corporate): a dropdown would just repeat the section name — list its categories directly. */}
          {groups.length === 1 && groups[0].categories.map((c) => {
            const on = c.id === activeId;
            return (
              <li key={c.id} className="shrink-0">
                <Link
                  href={c.href}
                  aria-current={on ? 'page' : undefined}
                  className={`group relative flex h-12 items-center px-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${on ? 'text-accent-text' : 'text-foreground/80 hover:text-foreground'}`}
                >
                  {c.name}
                  <span aria-hidden className={`absolute inset-x-2.5 bottom-0 h-0.5 origin-left rounded-full bg-accent-text transition-transform duration-300 ${on ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </Link>
              </li>
            );
          })}
          {groups.length > 1 && groups.map((g) => {
            const isOpen = open === g.slug;
            const isActive = activeGroup === g.slug;
            return (
              <li key={g.slug} className="shrink-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls="subnav-panel"
                  onClick={() => setOpen(isOpen ? null : g.slug)}
                  onPointerEnter={hoverOpen(g.slug)}
                  className={`group relative flex h-12 items-center gap-1 px-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${isOpen || isActive ? 'text-accent-text' : 'text-foreground/80 hover:text-foreground'}`}
                >
                  {g.name}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                  {/* Underline: solid for the current group, sweeps in for the open one. */}
                  <span aria-hidden className={`absolute inset-x-2.5 bottom-0 h-0.5 origin-left rounded-full bg-accent-text transition-transform duration-300 ${isOpen || isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </button>
              </li>
            );
          })}
        </ul>

        <a
          href={bookHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Check your date on WhatsApp"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary px-2.5 text-xs font-semibold text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Check your date</span>
        </a>
      </nav>

      {/* Full-width panel (outside the scrolling row so it is never clipped). */}
      <div
        id="subnav-panel"
        className={`absolute inset-x-0 top-full border-b border-border bg-[#FAF9F6] shadow-[0_24px_40px_-24px_rgba(0,0,0,0.35)] transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${panel ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}
      >
        {panel && (
          <div className="mx-auto max-h-[70svh] w-full max-w-7xl overflow-y-auto px-5 py-6 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">{panel.name}</p>
              {panel.categories[0] && (
                <Link href={sectionHref + '#categories'} onClick={() => setOpen(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-accent-text">
                  All {sectionName}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {columns.map(([sub, cats]) => (
                <div key={sub || 'all'} className={columns.length === 1 ? 'sm:col-span-2 lg:col-span-4' : ''}>
                  {sub && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">{sub}</p>}
                  <ul className={columns.length === 1 ? 'grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4' : ''}>
                    {cats.map((c, i) => {
                      const on = c.id === activeId;
                      return (
                        <li key={c.id} className="motion-safe:animate-[blog-card-in_420ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: `${i * 35}ms` }}>
                          <Link
                            href={c.href}
                            aria-current={on ? 'page' : undefined}
                            onClick={() => setOpen(null)}
                            className={`group flex items-center justify-between gap-4 border-b border-border/70 py-3 text-base transition-colors duration-200 ${on ? 'font-semibold text-accent-text' : 'text-foreground hover:text-accent-text'}`}
                          >
                            <span className="flex items-center gap-2">
                              <span aria-hidden className={`h-1.5 w-1.5 rounded-full bg-accent-text transition-transform duration-300 ${on ? 'scale-100' : 'scale-0 group-hover:scale-100'}`} />
                              {c.name}
                            </span>
                            {c.count !== undefined && (
                              <span className="text-xs tabular-nums text-foreground/50">{c.count ? `${c.count} ${c.count === 1 ? 'album' : 'albums'}` : 'Soon'}</span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
