'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, Mic, Pause, Play, ShieldCheck, Star, Zap, type LucideIcon } from 'lucide-react';

// Copy unchanged from the previous versions of this section and the old trust strip.
const GEAR: { name: string; category: string; badge: string; icon: LucideIcon; specs: string[] }[] = [
  { name: 'Sony G-Master Lenses', category: 'Optics', badge: 'Industry Standard', icon: Camera, specs: ['f/1.4-2.8', 'Full-Frame', 'OSS'] },
  { name: 'Hollyland Lark2 Mic', category: 'Audio', badge: 'Broadcast Quality', icon: Mic, specs: ['Wireless', 'Low Noise', 'Dual-Channel'] },
  { name: 'Godox Studio Lighting', category: 'Lighting', badge: 'Pro Output', icon: Zap, specs: ['AD600 Pro II', 'RGB LC1000R', 'Softboxes'] },
];
const BRANDS = ['Sony', 'Sigma', 'Godox', 'Hollyland'];
const GOOGLE_RATING = '5.0';

const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;

/** HH:MM:SS:FF at 24 fps — written straight to the DOM, no re-render per frame. */
const timecode = (t: number) => {
  const f = Math.floor((t % 1) * 24);
  const s = Math.floor(t);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f)}`;
};

/** Portrait reel inside a camera-monitor frame: viewfinder brackets, REC light, live timecode. */
function Viewfinder() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);

  // Play only while on screen (and never for reduced-motion visitors).
  useEffect(() => {
    const node = wrapRef.current;
    const v = videoRef.current;
    if (!node || !v || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduce) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.3 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [reduce]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const bracket = 'absolute h-6 w-6 border-white/80';

  return (
    <div ref={wrapRef} className="relative mx-auto w-fit">
      {/* Monitor body — black, like a field monitor. */}
      <div className="rounded-[1.75rem] bg-foreground p-2 shadow-[0_40px_80px_-40px_hsl(var(--foreground)/0.6)]">
        <div className="relative aspect-[9/16] h-[min(64svh,30rem)] overflow-hidden rounded-[1.25rem] bg-foreground lg:h-[min(68svh,34rem)]">
          {/* 720×1280 clip in a 9:16 frame — exact fit, no crop. */}
          <video
            ref={videoRef}
            src="/equipment-reel.webm"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Our equipment in use"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => { if (tcRef.current) tcRef.current.textContent = timecode(e.currentTarget.currentTime); }}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <track kind="captions" src="data:text/vtt," srcLang="en" label="No captions" />
          </video>

          {/* Viewfinder overlay — decorative. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span className={`${bracket} left-4 top-4 border-l-2 border-t-2`} />
            <span className={`${bracket} right-4 top-4 border-r-2 border-t-2`} />
            <span className={`${bracket} bottom-16 left-4 border-b-2 border-l-2`} />
            <span className={`${bracket} bottom-16 right-4 border-b-2 border-r-2`} />
            <span className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-white/50" />
            <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-white/50" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent px-6 pb-6 pt-6 text-[10px] font-semibold tracking-[0.2em] text-white">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full bg-accent-text ${playing ? 'motion-safe:animate-pulse' : 'opacity-40'}`} />
                REC
              </span>
              <span ref={tcRef} className="tabular-nums">00:00:00:00</span>
            </div>
          </div>

          {/* Bottom bar with the pause control (also the WCAG 2.2.2 pause for auto-playing video). */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-8">
            <span aria-hidden className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">Wandering Kite</span>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause video' : 'Play video'}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 before:absolute before:-inset-1 before:content-[''] active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {playing ? <Pause className="h-3.5 w-3.5" fill="currentColor" aria-hidden /> : <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TechSpecs() {
  const reduce = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SETTLE, delay },
  });

  return (
    <section aria-labelledby="gear-heading" className="border-y border-border bg-card">
      {/* Strict spacing (8px grid): top + bottom 24/32 (one block gap to each neighbour), column gap 48 → 64. */}
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-6 pt-6 sm:px-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:pb-8 lg:pt-8 xl:gap-16 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        {/* ── Left: heading, care note, Google reviews, premium gear ── */}
        <motion.div {...reveal(0)} className="md:col-span-2 lg:col-span-4">
          <h2 id="gear-heading" className="text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
            Professional-Grade Equipment
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-foreground">
            The same gear used by top production houses and content creators worldwide.
          </p>
          <p className="mt-6 flex max-w-md items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            All equipment is insured, regularly serviced, and sanitized between rentals
          </p>

          <div className="mt-6 grid max-w-md grid-cols-[auto_1fr] items-start gap-x-8 gap-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Google Reviews</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl font-bold tabular-nums leading-none tracking-[-0.03em] text-foreground">{GOOGLE_RATING}</span>
                <span className="flex gap-0.5">
                  <span className="sr-only">Rated {GOOGLE_RATING} out of 5 on Google</span>
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} aria-hidden="true" className="h-4 w-4 fill-accent-text text-accent-text" />)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Premium Gear</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {BRANDS.map((b) => (
                  <li key={b} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* ── Centre: the viewfinder ── */}
        <motion.div {...reveal(0.08)} className="lg:col-span-4">
          <Viewfinder />
        </motion.div>

        {/* ── Right: gear as a compact spec sheet ── */}
        <ul className="lg:col-span-4">
          {GEAR.map((g, i) => (
            <motion.li
              key={g.name}
              {...reveal(0.12 + 0.06 * i)}
              className="group relative grid grid-cols-[auto_1fr] gap-x-4 border-t border-border py-5 last:border-b"
            >
              <span aria-hidden className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
              <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-foreground transition-colors duration-300 group-hover:bg-neutral">
                <g.icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">
                  {g.category} <span className="text-foreground/65">· {g.badge}</span>
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.015em] text-foreground">{g.name}</h3>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${g.name} specifications`}>
                  {g.specs.map((s) => (
                    <li key={s} className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground">{s}</li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
