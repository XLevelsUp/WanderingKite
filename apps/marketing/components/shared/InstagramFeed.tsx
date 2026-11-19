'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Instagram, Play, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { logger } from '@/lib/logger';
import { retryViaRelay } from '@/lib/instagram-media';
import { ReelAccordion } from '@/components/sections/ReelAccordion';

interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  permalink: string;
}

interface InstagramFeedProps {
  account?: string;
  /** 'gallery' = the homepage expanding reel strip (ReelAccordion); 'footer' = the footer band's row + carousel. */
  variant?: 'footer' | 'gallery';
  /** Called once if the feed fails or is empty, so the parent can drop the feed's slot from its layout. */
  onUnavailable?: () => void;
}


// Media sits on black inside the card, so card chrome uses black shadows (correct on light and dark pages).
const CARD_SHADOW =
  'shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)]';

// ── Sub-components ────────────────────────────────────────────────────────

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-muted animate-pulse ${className}`}>
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent animate-shimmer"
        style={{ backgroundSize: '200% 100%' }}
      />
    </div>
  );
}

function Badge({ type }: { type: 'live' | 'reel' }) {
  return (
    <div className="absolute left-3 top-3 z-[3] flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
      {type === 'live' ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-accent-text motion-safe:animate-pulse" />
          Live
        </>
      ) : (
        <>
          <Film className="h-3 w-3 text-white/70" aria-hidden />
          Reel
        </>
      )}
    </div>
  );
}

function IGBadge() {
  return (
    <div className="absolute right-3 top-3 z-[3] flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
      <Instagram className="h-3.5 w-3.5 text-white" aria-hidden />
    </div>
  );
}

/** Hover pill — pointer devices */
function HoverPill() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex translate-y-2 justify-center pb-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-4 py-2 backdrop-blur-xl">
        <Instagram className="h-3 w-3 shrink-0 text-white/60" aria-hidden />
        <span className="whitespace-nowrap text-[11px] font-medium tracking-wide text-white/90">View full profile on Instagram</span>
        <span className="text-[10px] text-white/40" aria-hidden>↗</span>
      </div>
    </div>
  );
}

/** Always-visible pill — touch carousel */
function AlwaysPill() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-3">
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3.5 py-1.5 backdrop-blur-xl">
        <Instagram className="h-3 w-3 shrink-0 text-white/60" aria-hidden />
        <span className="text-[10px] font-medium tracking-wide text-white/85">View Post</span>
        <span className="text-[9px] text-white/40" aria-hidden>↗</span>
      </div>
    </div>
  );
}

// ── Shared card ───────────────────────────────────────────────────────────

interface CardProps {
  item: InstagramMediaItem;
  videoRef: (el: HTMLVideoElement | null) => void;
  /** The layout's lead card: playback is driven by the parent, so it gets the Live badge and no play overlay. */
  featured?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /** Must include aspect-* so the frame is never distorted */
  className?: string;
}

function Card({ item, videoRef, featured = false, onMouseEnter, onMouseLeave, className = '' }: CardProps) {
  const isVideo = item.media_type === 'VIDEO';

  return (
    <a
      href={item.permalink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View this post on Instagram"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative block overflow-hidden rounded-2xl bg-black ring-1 ring-inset ring-white/10 transition-all duration-500 hover:-translate-y-2 hover:ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${CARD_SHADOW} ${className}`}
    >
      {isVideo ? (
        <>
          {/* object-contain: never crops. No autoPlay: the parent plays only the visible layout's lead video. */}
          <video
            ref={videoRef}
            src={item.media_url}
            poster={item.thumbnail_url}
            preload="none"
            muted
            loop
            playsInline
            onError={(e) => retryViaRelay(e, item.media_url)}
            className="absolute inset-0 z-[1] h-full w-full object-contain"
          >
            <track kind="captions" src="data:text/vtt," srcLang="en" label="No captions" />
          </video>

          {!featured && (
            <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/35 transition-opacity duration-300 group-hover:opacity-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-md transition-transform duration-200 group-hover:scale-110">
                <Play className="ml-0.5 h-4 w-4 fill-white text-white" aria-hidden />
              </div>
            </div>
          )}

          <Badge type={featured ? 'live' : 'reel'} />
        </>
      ) : (
        <>
          <img
            src={item.media_url}
            alt="Instagram post from @wanderingkitestudio"
            onError={(e) => retryViaRelay(e, item.media_url)}
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div
            aria-hidden
            className="absolute inset-0 z-[2] bg-gradient-to-t from-black/55 to-transparent to-55% opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </>
      )}

      <IGBadge />
      <HoverPill />
    </a>
  );
}

// ── Main export ───────────────────────────────────────────────────────────

export function InstagramFeed({ account = 'wanderingkite', variant = 'footer', onUnavailable }: InstagramFeedProps) {
  const gallery = variant === 'gallery';
  const reduce = useReducedMotion();

  const [media, setMedia] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tell the parent once the fetch has settled with nothing to show.
  useEffect(() => {
    if (!loading && (error || media.length === 0)) onUnavailable?.();
  }, [loading, error, media.length, onUnavailable]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktop, setDesktop] = useState(false);

  // Separate ref lists: both layouts render (CSS hides one), so a shared list let hidden copies overwrite visible ones.
  const deskRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Footer layout switch mirrors the md breakpoint (row ≥768px, carousel below).
  useEffect(() => {
    const md = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(md.matches);
    update();
    md.addEventListener('change', update);
    return () => md.removeEventListener('change', update);
  }, []);

  // ── Lazy load ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setShouldLoad(true); return; }
    const node = sectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (es) => { if (es.some((e) => e.isIntersecting)) { setShouldLoad(true); obs.disconnect(); } },
      { rootMargin: '400px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shouldLoad) return;
    async function go() {
      try {
        setLoading(true);
        const res = await fetch(`/api/instagram?account=${account}`);
        if (!res.ok) throw new Error('fetch failed');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setMedia(json.data);
        } else {
          throw new Error(json.error || 'bad response');
        }
      } catch (e: any) {
        logger.warn('Instagram feed error (hidden gracefully):', e);
        setError('failed');
        setMedia([]);
      } finally {
        setLoading(false);
      }
    }
    go();
  }, [account, shouldLoad]);

  // ── Footer playback: only the visible layout's lead video plays ────────
  useEffect(() => {
    if (gallery || !media.length) return;
    const target = reduce ? null : desktop ? deskRefs.current[0] : mobRefs.current[activeIndex];
    [...deskRefs.current, ...mobRefs.current].forEach((v) => {
      if (!v) return;
      if (v === target) v.play().catch(() => {});
      else if (!v.paused) { v.pause(); v.currentTime = 0; }
    });
  }, [gallery, desktop, activeIndex, media, reduce]);

  const hoverPlay = useCallback((i: number) => {
    if (i === 0) return;
    deskRefs.current[i]?.play().catch((e) => logger.warn('hover play failed', e));
  }, []);
  const hoverStop = useCallback((i: number) => {
    if (i === 0) return;
    const v = deskRefs.current[i];
    if (v) { v.pause(); v.currentTime = 0; }
  }, []);

  // ── Carousel ────────────────────────────────────────────────────────── One slide's travel.
  const step = (c: HTMLDivElement) =>
    ((c.firstElementChild as HTMLElement | null)?.offsetWidth ?? c.clientWidth) + 16;

  const scrollTo = useCallback((idx: number) => {
    const c = carouselRef.current;
    if (c) { c.scrollTo({ left: idx * step(c), behavior: reduce ? 'auto' : 'smooth' }); setActiveIndex(idx); }
  }, [reduce]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const c = e.currentTarget;
    const idx = Math.round(c.scrollLeft / step(c));
    if (idx !== activeIndex && idx >= 0 && idx < media.length) setActiveIndex(idx);
  };

  // ── Skeleton (also the lazy-load observer target) ─────────────────────
  if (loading) {
    if (gallery) {
      return (
        <div className="w-full" ref={sectionRef}>
          {/* Same height steps as ReelAccordion (+ its 12/16px offset), so nothing jumps when reels arrive. */}
          <div className="h-[calc(min(56svh,22rem)+0.75rem)] animate-pulse bg-muted sm:h-[calc(min(58svh,26rem)+1rem)] 2xl:h-[calc(min(58svh,30rem)+1rem)] 3xl:h-[calc(min(58svh,34rem)+1rem)] [[data-theme=studio]_&]:h-[min(56svh,22rem)] sm:[[data-theme=studio]_&]:h-[min(58svh,26rem)] 2xl:[[data-theme=studio]_&]:h-[min(58svh,30rem)] 3xl:[[data-theme=studio]_&]:h-[min(58svh,34rem)]" />
        </div>
      );
    }
    return (
      <div className="w-full" ref={sectionRef}>
        <div className="hidden gap-4 md:flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1"><SkeletonCard className="aspect-[9/16]" /></div>
          ))}
        </div>
        <div className="mx-auto w-[84%] max-w-[22rem] md:hidden">
          <SkeletonCard className="aspect-[9/16]" />
        </div>
      </div>
    );
  }

  if (error || media.length === 0) return null;

  // Homepage: framed reel player.
  if (gallery) {
    return (
      <div className="w-full" ref={sectionRef}>
        <ReelAccordion media={media.slice(0, 5)} />
      </div>
    );
  }

  return (
    <div className="w-full" ref={sectionRef}>
      {/* DESKTOP md+ — equal row */}
      <div className="hidden gap-4 md:flex">
        {media.slice(0, 5).map((item, i) => (
          <div key={item.id} className="flex-1">
            <Card
              item={item}
              videoRef={(el) => { deskRefs.current[i] = el; }}
              featured={i === 0 && item.media_type === 'VIDEO'}
              onMouseEnter={() => hoverPlay(i)}
              onMouseLeave={() => hoverStop(i)}
              className="aspect-[9/16] w-full"
            />
          </div>
        ))}
      </div>

      {/* MOBILE <md — snap carousel. A w-full slide fills the padded track, so it centres and neighbours peek through the padding. */}
      <div className="md:hidden">
        <div
          ref={carouselRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[8%] pb-6 pt-1 [scrollbar-width:none] sm:px-[22%] [&::-webkit-scrollbar]:hidden"
        >
          {media.map((item, i) => {
            const active = activeIndex === i;
            return (
              <div
                key={item.id}
                className={`w-full shrink-0 snap-center snap-always transition-[opacity,transform] duration-300 ${
                  active ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-50'
                }`}
              >
                <Card
                  item={item}
                  videoRef={(el) => { mobRefs.current[i] = el; }}
                  featured={active && item.media_type === 'VIDEO'}
                  className="aspect-[9/16] w-full"
                />
              </div>
            );
          })}
        </div>

        {/* Controls — 44px targets */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous post"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>

          <div className="flex items-center" role="tablist" aria-label="Instagram posts">
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={activeIndex === i}
                aria-label={`Post ${i + 1}`}
                onClick={() => scrollTo(i)}
                className="flex h-11 w-7 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    activeIndex === i ? 'h-2 w-5 bg-foreground' : 'h-2 w-2 bg-foreground/25'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollTo(Math.min(media.length - 1, activeIndex + 1))}
            disabled={activeIndex === media.length - 1}
            aria-label="Next post"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <p className="mt-2 text-center text-xs tabular-nums text-foreground/60">
          {activeIndex + 1} / {media.length}
        </p>
      </div>
    </div>
  );
}
