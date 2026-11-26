'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PortfolioPhoto } from '@/lib/photography/data';
import { storySerif } from '@/lib/fonts';
import { NearImage } from './NearImage';

// Each print hangs at a slightly different angle, like prints drying on a line (static classes for Tailwind).
const TILT = ['-rotate-[2.5deg]', 'rotate-[1.5deg]', '-rotate-1', 'rotate-[2deg]', '-rotate-[1.5deg]'];

/**
 * "Recent work" as prints drying on a darkroom line: a cord runs across, each photo hangs from a wooden peg
 * as a white-bordered print with a serif label. Prints drop onto the line as the section enters view
 * (data-reveal) and straighten + lift on hover. One horizontal row: swipe on touch, arrows on desktop.
 */
export function PortfolioRail({ photos }: { photos: PortfolioPhoto[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft > max - 8);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  // Desktop: click-and-drag to swipe the row with a mouse (touch and trackpads already scroll natively).
  // Snap is paused while dragging and restored on release so it settles on a print; a real drag swallows the
  // click that follows, so dragging never opens an album by accident.
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (e: React.PointerEvent) => {
    const el = rail.current;
    if (!el || e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = rail.current;
    const d = drag.current;
    if (!el || !d.active) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
      // Capture only once it's a real drag, so a plain click still lands on the print's link.
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = 'none';
      el.style.scrollBehavior = 'auto';
    }
    if (d.moved) el.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const el = rail.current;
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    if (el) {
      el.style.scrollBehavior = '';
      el.style.scrollSnapType = '';
    }
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const tile = el?.querySelector('li');
    if (!el || !tile) return;
    el.scrollBy({ left: dir * (tile.getBoundingClientRect().width + 32), behavior: 'smooth' });
  };

  const btn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-foreground/25 text-foreground transition-colors duration-200 hover:border-accent-bright hover:bg-accent-bright hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30';

  return (
    <div>
      {/* Desktop controls: progress + arrows (phones swipe). */}
      <div className="mb-2 hidden items-center justify-end gap-4 sm:flex">
        <div className="relative h-px w-40 bg-foreground/15">
          <span className="absolute inset-y-0 left-0 w-full origin-left bg-accent-bright transition-transform duration-300" style={{ transform: `scaleX(${Math.max(progress, 0.06)})` }} />
        </div>
        <button type="button" aria-label="Previous prints" onClick={() => step(-1)} disabled={atStart} className={btn}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" aria-label="More prints" onClick={() => step(1)} disabled={atEnd} className={btn}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={rail}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`-mx-5 snap-x snap-mandatory scroll-px-5 overflow-x-auto px-5 pb-6 pt-6 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden [@media(pointer:fine)]:cursor-grab [&_a]:[-webkit-user-drag:none] [&_img]:[-webkit-user-drag:none] ${dragging ? 'cursor-grabbing select-none [&_a]:pointer-events-none' : ''}`}
      >
        <ul className="relative flex w-max gap-8 pr-5 pt-4 sm:pr-8 lg:pr-0">
          {/* The drying line: a taut cord across every print, with a soft shadow on the wall. */}
          <span aria-hidden className="absolute -left-5 -right-5 top-[13px] h-[2px] rounded-full bg-[#8B7462] shadow-[0_3px_4px_rgba(0,0,0,0.18)] sm:-left-8 sm:-right-8 lg:left-0 lg:right-0" />

          {photos.map((p, i) => (
            <li key={p.id} data-reveal style={{ '--d': `${Math.min(i, 5) * 110}ms` } as CSSProperties} className="w-[58vw] max-w-[16rem] shrink-0 snap-start sm:w-[15rem] lg:w-[16rem]">
              <Link
                href={p.href}
                draggable={false}
                className={`group relative block origin-top ${TILT[i % TILT.length]} transition-transform duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] hover:-translate-y-1.5 hover:rotate-0 focus-visible:rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 motion-reduce:transition-none`}
              >
                {/* Wooden peg clipping the print to the cord */}
                <span aria-hidden className="absolute -top-4 left-1/2 z-10 h-8 w-3.5 -translate-x-1/2 rounded-[3px] bg-gradient-to-r from-[#B88E5E] via-[#D4AE7E] to-[#A97F52] shadow-[0_2px_3px_rgba(0,0,0,0.3)]">
                  <span className="absolute inset-x-0 top-3 h-1 bg-[#9a9a9a]/80" />
                </span>

                {/* The print: white border, thicker at the bottom, with a hand label */}
                <div className="bg-white p-2.5 pb-3 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.45)] transition-shadow duration-500 group-hover:shadow-[0_26px_44px_-18px_rgba(0,0,0,0.5)]">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <NearImage
                      src={p.url}
                      alt={p.alt}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-2 px-1 pt-3">
                    <span className={`${storySerif.className} truncate text-xl font-semibold italic leading-none text-foreground transition-colors group-hover:text-accent-text`}>
                      {p.caption.split(' · ')[0]}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] font-semibold tracking-[0.15em] text-foreground/70">№ {String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="px-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">{p.caption.split(' · ')[1] ?? ''}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
