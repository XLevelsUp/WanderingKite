'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight, Aperture, Building2, Camera, Pause, Play } from 'lucide-react';

export type HeroMedia =
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; alt: string; poster?: string; caption?: string };

// Critically damped (no overshoot) — nothing here was flicked, so nothing should bounce.
const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;
const TILT_SPRING = { stiffness: 170, damping: 26, mass: 1 };

// Fine-grain noise for the placeholder, so it reads as paper rather than a flat fill.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export function HeroSection({ media }: { media?: HeroMedia }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll parallax: the frame lags the page as the hero leaves. Motion values only — no re-renders.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const frameY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-background pb-10 pt-28 sm:pb-12 sm:pt-32 lg:flex lg:min-h-[88svh] lg:flex-col lg:justify-center lg:pb-6 lg:pt-24"
    >
      {/* Background photo — decorative, so empty alt; the porcelain wash keeps black text legible. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* hero-bg.webp is DSC06629.webp resized to 1800px (236 KB) — next/image runs unoptimized here. */}
        <motion.div style={reduce ? undefined : { y: bgY }} className="absolute -top-8 bottom-[-140px] left-0 right-0">
          <Image src="/hero-bg.webp" alt="" fill priority sizes="100vw" className="object-cover object-[50%_40%] brightness-[0.68] contrast-[1.1] lg:object-[50%_60%]" />
        </motion.div>
        {/* Porcelain only where text sits: top on mobile, right on desktop — the rest of the photo stays visible. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 from-20% via-background/75 via-55% to-background/0 lg:bg-gradient-to-l lg:from-background lg:from-30% lg:via-background/70 lg:via-50% lg:to-background/0" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12 2xl:max-w-[88rem] 2xl:gap-20 3xl:max-w-[112rem] 3xl:px-16">
        {/* Copy — first on mobile: it is the LCP element and the core message. */}
        <div className="text-center lg:order-2 lg:col-span-6 lg:text-left xl:col-span-5">
          {/* Eyebrow + h1 are not animated: they paint before hydration, which keeps LCP fast. */}
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-text sm:text-xs 2xl:text-sm">
            Creative Infrastructure
          </p>

          <h1 className="text-[clamp(2.75rem,9vw,5.25rem)] font-bold leading-[1.02] tracking-[-0.035em] text-foreground lg:text-[clamp(3rem,4.6vw,4.75rem)] 2xl:text-[clamp(4.75rem,4.3vw,6.5rem)]">
            Where Vision
            <br />
            <span className="text-accent-bright">Meets Craft</span>
          </h1>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SETTLE, delay: 0.15 }}
          >
            <h2 className="mx-auto mt-6 max-w-md text-balance text-[11px] font-semibold uppercase tracking-[0.28em] leading-relaxed text-foreground sm:text-xs lg:mx-0 lg:max-w-xl lg:text-[13px] 2xl:mt-8 2xl:max-w-2xl 2xl:text-sm">
              {/* Two fixed pairs, so a wrap never leaves a dangling "·" at a line end. */}
              <span className="block">Photography · Equipment Rentals</span>
              <span className="block mt-1 sm:mt-1.5">Studio Spaces · Podcast Production</span>
            </h2>

            {/* Two "doors" — one per part of the site — so visitors see there are two places to go.
                Photography = warm taupe card; Studio Space = dark card (previews the dark studio pages).
                A light sweep crosses each card in turn and the arrows nudge on a slow loop (CSS, reduced-motion safe). */}
            <p className="mt-9 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/70 lg:justify-start 2xl:mt-11">
              Explore our two studios
              <ArrowRight aria-hidden className="door-bob h-3.5 w-3.5 rotate-90 text-accent-bright" />
            </p>
            <div className="mx-auto mt-3 flex max-w-[26rem] flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center lg:mx-0 lg:max-w-[26rem] lg:flex-col">
              <Link
                href="/photography"
                className="door group relative flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl bg-primary py-3 pl-3 pr-3 text-left text-primary-foreground shadow-[0_12px_30px_-14px_hsl(var(--primary-deep)/0.8)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(255,85,0,0.55)] active:scale-[0.98] sm:max-w-[19rem] lg:max-w-none"
              >
                <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/10">
                  <Camera className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block whitespace-nowrap text-base font-bold leading-tight">Photography</span>
                  <span className="block truncate text-xs font-medium text-black/70">Weddings, events &amp; brands</span>
                </span>
                <span aria-hidden className="door-arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/10 transition-colors duration-300 group-hover:bg-black group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/studiospace"
                className="door door-late group relative flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#141212] py-3 pl-3 pr-3 text-left text-white shadow-[0_12px_30px_-14px_rgba(0,0,0,0.7)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-accent-bright/60 hover:shadow-[0_18px_36px_-14px_rgba(255,85,0,0.55)] active:scale-[0.98] sm:max-w-[19rem] lg:max-w-none"
              >
                <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-bright/15 text-accent-bright">
                  <Building2 className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block whitespace-nowrap text-base font-bold leading-tight">Studio Space</span>
                  <span className="block truncate text-xs font-medium text-white/70">1200 sq ft studio &amp; podcast</span>
                </span>
                <span aria-hidden className="door-arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-bright text-black transition-transform duration-300">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            <div className="mt-9 2xl:mt-11 2xl:text-base flex items-center justify-center gap-4 text-sm text-foreground lg:justify-start">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                Available Now
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-neutral" />
              <span>Coimbatore, India</span>
            </div>
          </motion.div>
        </div>

        {/* Media — the stacked frame. */}
        <motion.div style={reduce ? undefined : { y: frameY }} className="lg:order-1 lg:col-span-6 xl:col-span-7">
          <StackedFrame media={media} reduce={!!reduce} />
        </motion.div>
      </div>

      {/* Scroll cue — desktop only; in flow below the grid so it can never overlap the frame. */}
      <a
        href="#services"
        className="mx-auto mt-14 hidden flex-col items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground transition-opacity duration-200 hover:opacity-70 lg:flex"
      >
        Scroll
        <span aria-hidden="true" className="relative h-10 w-px overflow-hidden bg-foreground/15">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-foreground motion-safe:animate-scroll-cue" />
        </span>
      </a>
    </section>
  );
}

function StackedFrame({ media, reduce }: { media?: HeroMedia; reduce: boolean }) {
  // Pointer position, normalised to -0.5 … 0.5 across the frame.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, TILT_SPRING);
  const sy = useSpring(py, TILT_SPRING);

  const rotateY = useTransform(sx, [-0.5, 0.5], [-4, 4]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [3, -3]);
  // The back block drifts against the tilt, so the layers read as physically separate.
  const backX = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const backY = useTransform(sy, [-0.5, 0.5], [10, -10]);

  const track = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const release = () => {
    px.set(0);
    py.set(0);
  };

  const isVideo = media?.type === 'video';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(!reduce);
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  return (
    <div
      onPointerMove={track}
      onPointerLeave={release}
      // Video is 16:9, so the frame widens to show the whole shot; stills keep the 4:5 portrait frame.
      className={`relative mx-auto w-full pb-5 pr-5 [perspective:1400px] sm:pb-7 sm:pr-7 ${
        isVideo ? 'max-w-2xl lg:max-w-none' : 'max-w-[22rem] sm:max-w-md lg:max-w-[34rem]'
      }`}
    >
      {/* Layer 1 — sandstone block, offset down-right. */}
      <motion.div
        aria-hidden="true"
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: -20, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ ...SETTLE, delay: 0.1 }}
        className="absolute bottom-0 left-5 right-0 top-5 sm:left-7 sm:top-7"
      >
        <motion.div style={reduce ? undefined : { x: backX, y: backY }} className="h-full w-full bg-neutral" />
      </motion.div>

      {/* Layer 2 — mist mount carrying the media, caption and controls. */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SETTLE}
            style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
            // Tight shadow: a wide blur fell across the sandstone block and muddied it.
            className="relative bg-card p-3 shadow-[0_1px_2px_hsl(var(--foreground)/0.08),0_14px_28px_-14px_hsl(var(--foreground)/0.35)] sm:p-4"
          >
            <div className={`relative w-full overflow-hidden bg-muted ${isVideo ? 'aspect-video' : 'aspect-[4/5]'}`}>
              {media ? (
                <MediaFill
                  media={media}
                  reduce={reduce}
                  videoRef={videoRef}
                  onPlayState={setPlaying}
                />
              ) : (
                <ProofPlaceholder />
              )}
            </div>

            {(media?.caption || isVideo) && (
              <div className="flex items-center justify-between gap-4 pt-3 sm:pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground sm:text-[11px]">
                  {media?.caption}
                </p>
                {isVideo && (
                  // 36px visual, 48px hit area via the pseudo-element.
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? 'Pause video' : 'Play video'}
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[transform,background-color] duration-200 before:absolute before:-inset-1.5 before:content-[''] hover:bg-primary/90 active:scale-[0.94]"
                  >
                    {playing ? (
                      <Pause className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
                    ) : (
                      <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
    </div>
  );
}

function MediaFill({
  media,
  reduce,
  videoRef,
  onPlayState,
}: {
  media: HeroMedia;
  reduce: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onPlayState: (playing: boolean) => void;
}) {
  if (media.type === 'image') {
    return (
      <Image
        src={media.src}
        alt={media.alt}
        fill
        priority
        sizes="(min-width: 1024px) 34rem, (min-width: 640px) 28rem, 22rem"
        className="object-cover"
      />
    );
  }
  // Reduced motion: no autoplay — the poster stands in as a still. Placeholder shows until the first frame paints.
  return (
    <>
    <ProofPlaceholder />
    <video
      ref={videoRef}
      onPlay={() => onPlayState(true)}
      onPause={() => onPlayState(false)}
      src={media.src}
      poster={media.poster}
      aria-label={media.alt}
      autoPlay={!reduce}
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover"
    />
    </>
  );
}

/** Stand-in until real media is supplied — styled as a proof print so the layout still reads as finished. */
function ProofPlaceholder() {
  const mark = 'absolute h-5 w-5 border-foreground/35';
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-muted via-card to-secondary/40">
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />

      {/* Crop marks */}
      <span aria-hidden="true" className={`${mark} left-4 top-4 border-l border-t`} />
      <span aria-hidden="true" className={`${mark} right-4 top-4 border-r border-t`} />
      <span aria-hidden="true" className={`${mark} bottom-4 left-4 border-b border-l`} />
      <span aria-hidden="true" className={`${mark} bottom-4 right-4 border-b border-r`} />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/55">
        <Aperture className="h-8 w-8" strokeWidth={1.25} aria-hidden="true" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em]">Image / Video</p>
      </div>
    </div>
  );
}
