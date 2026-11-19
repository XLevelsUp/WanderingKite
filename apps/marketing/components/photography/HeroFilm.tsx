'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

/**
 * Photography hero film inside a camera-viewfinder frame: whole 16:9 frame (never cropped), muted loop, plays only
 * while on screen; REC dot, live timecode (updated via textContent, no re-renders) and exposure ticks are decorative.
 * Reduced motion: shows the poster with a play button instead of autoplaying.
 */
export function HeroFilm({ src, poster, label }: { src: string; poster: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  // Play only while visible (and motion allowed); pause off-screen to save CPU/battery.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduce && !userPaused.current) v.play().catch(() => {});
      else if (!e.isIntersecting) v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // Timecode HH:MM:SS:FF at 24fps, written straight to the DOM while playing.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && tcRef.current) {
        const t = v.currentTime;
        const p = (n: number) => String(Math.floor(n)).padStart(2, '0');
        tcRef.current.textContent = `00:${p(t / 60)}:${p(t % 60)}:${p((t % 1) * 24)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}); }
    else { userPaused.current = true; v.pause(); }
  };

  const bracket = 'absolute h-6 w-6 border-white/90 sm:h-8 sm:w-8';

  return (
    <figure>
      {/* House motif: porcelain mat + offset sandstone block behind — scoped to the frame so it never covers the caption. */}
      <div className="relative">
      <div aria-hidden className="absolute -bottom-3 -right-3 left-3 top-3 rounded-2xl bg-[#CBB9A4] sm:-bottom-4 sm:-right-4 sm:left-4 sm:top-4" />
      <div className="relative rounded-2xl bg-[#FAF9F6] p-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] sm:p-3">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label={label}
            className="absolute inset-0 h-full w-full object-contain"
          >
            <track kind="captions" src="data:text/vtt," srcLang="en" label="No captions" />
          </video>

          {/* ── Viewfinder overlay (decorative) ── */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.35)_100%)]" />
            <span className={`${bracket} left-3 top-3 border-l-2 border-t-2 sm:left-5 sm:top-5`} />
            <span className={`${bracket} right-3 top-3 border-r-2 border-t-2 sm:right-5 sm:top-5`} />
            <span className={`${bracket} bottom-3 left-3 border-b-2 border-l-2 sm:bottom-5 sm:left-5`} />
            <span className={`${bracket} bottom-3 right-3 border-b-2 border-r-2 sm:bottom-5 sm:right-5`} />
            {/* Focus box locked on the couple (centre-right in this film). */}
            <span className="absolute left-[67%] top-[52%] h-10 w-12 -translate-x-1/2 -translate-y-1/2 border border-white/60 sm:h-16 sm:w-20" />
            {/* REC + timecode. */}
            <span className="absolute left-10 top-4 flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-white sm:left-16 sm:top-6 sm:text-xs">
              <span className={`h-2 w-2 rounded-full bg-[#FF5500] ${playing ? 'motion-safe:animate-pulse' : 'opacity-40'}`} />
              REC
              {/* Timecode sits with REC (top-left): the film's own logo animates in the top-right. */}
              <span ref={tcRef} className="ml-2 hidden font-normal tabular-nums tracking-[0.15em] text-white/90 sm:inline">
                00:00:00:00
              </span>
            </span>
            {/* Exposure scale. */}
            <span className="absolute bottom-4 left-12 hidden items-end gap-1.5 sm:bottom-6 sm:left-16 sm:flex">
              {[-2, -1, 0, 1, 2].map((n) => (
                <span key={n} className="flex flex-col items-center gap-1">
                  <span className={`w-px bg-white/80 ${n === 0 ? 'h-3' : 'h-2'}`} />
                  <span className="font-mono text-[9px] text-white/70">{n > 0 ? `+${n}` : n}</span>
                </span>
              ))}
            </span>
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause film' : 'Play film'}
            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-black backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:bottom-5 sm:right-5"
          >
            {playing ? <Pause className="h-4 w-4" fill="currentColor" aria-hidden /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />}
          </button>
        </div>
      </div>
      </div>
      <figcaption className="mt-6 flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60 sm:mt-8">
        <span>{label}</span>
        <span className="hidden sm:inline">Wedding film</span>
      </figcaption>
    </figure>
  );
}
