'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Pause, Play } from 'lucide-react';

export interface ReelItem {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  permalink: string;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/* Expanding reel strip. */
export function ReelAccordion({ media }: { media: ReelItem[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cover = (m: ReelItem) => m.thumbnail_url || m.media_url;

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [inView, reduce, active]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div
      ref={rootRef}
      // --h: strip height, capped by screen height; the open panel is exactly --h × 9/16 wide.
      className="relative pb-3 pr-3 [--h:min(56svh,22rem)] sm:pb-4 sm:pr-4 sm:[--h:min(58svh,26rem)] 2xl:[--h:min(58svh,30rem)] 3xl:[--h:min(58svh,34rem)]"
    >
      {/* Brand motif: sandstone block offset behind, as on the hero frame. */}
      <div aria-hidden className="absolute bottom-0 left-3 right-0 top-3 bg-neutral sm:left-4 sm:top-4" />

      <div role="tablist" aria-label="Instagram reels" className="relative flex h-[var(--h)] gap-1.5 bg-background p-1.5 sm:gap-2 sm:p-2">
        {media.map((m, i) => {
          const on = i === active;
          const isVideo = m.media_type === 'VIDEO';
          return (
            <div
              key={m.id}
              role="tab"
              tabIndex={0}
              aria-selected={on}
              aria-label={`Reel ${i + 1} of ${media.length}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') setActive((i + 1) % media.length);
                if (e.key === 'ArrowLeft') setActive((i - 1 + media.length) % media.length);
              }}
              style={{ flex: on ? '0 0 calc((var(--h) - 1rem) * 0.5625)' : '1 1 0%' }}
              className="group relative min-w-0 cursor-pointer overflow-hidden bg-muted transition-[flex] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              {on ? (
                <>
                  {/* Open: uncropped (object-contain) over a blurred copy of the cover. */}
                  <img src={cover(m)} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-80 blur-2xl" />
                  {isVideo ? (
                    <video
                      key={m.id}
                      ref={videoRef}
                      src={m.media_url}
                      poster={m.thumbnail_url}
                      preload="metadata"
                      autoPlay={inView && !reduce}
                      muted
                      playsInline
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => setActive((i + 1) % media.length)}
                      className="absolute inset-0 h-full w-full object-contain"
                    >
                      <track kind="captions" src="data:text/vtt," srcLang="en" label="No captions" />
                    </video>
                  ) : (
                    <img src={m.media_url} alt={`Instagram post ${i + 1} from @wanderingkitestudio`} className="absolute inset-0 h-full w-full object-contain" />
                  )}

                  {/* Caption bar */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                      {pad2(i + 1)} · {isVideo ? 'Reel' : 'Post'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {isVideo && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggle(); }}
                          aria-label={playing ? 'Pause reel' : 'Play reel'}
                          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          {playing ? <Pause className="h-3 w-3" fill="currentColor" aria-hidden /> : <Play className="ml-0.5 h-3 w-3" fill="currentColor" aria-hidden />}
                        </button>
                      )}
                      <a
                        href={m.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="View on Instagram"
                        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Closed: a slice of the cover, softened, with its number. */}
                  <img src={cover(m)} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-75 grayscale-[30%] transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[0.18em] text-white">
                    {pad2(i + 1)}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
