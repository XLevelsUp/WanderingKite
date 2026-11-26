'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { MediaPlaceholder } from './MediaPlaceholder';

/**
 * Muted looping video that only downloads and plays while on screen (preload="none" + IntersectionObserver),
 * never cropped (object-contain over a blurred poster). Without a `src` it renders a video placeholder.
 */
export function VideoSlot({
  src,
  poster,
  label,
  className = 'aspect-video',
}: {
  src?: string | null;
  poster?: string | null;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  // A <video poster> downloads immediately even with preload="none", so the poster (and its blurred backdrop)
  // is only attached once the slot is within ~400px of the viewport.
  const [near, setNear] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNear(true); io.disconnect(); }
    }, { rootMargin: '400px' });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [userPaused]);

  if (!src) return <MediaPlaceholder kind="video" label={label ?? 'Film coming soon'} className={className} />;

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { setUserPaused(false); v.play().catch(() => {}); }
    else { setUserPaused(true); v.pause(); }
  };

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {/* Blurred backdrop is decorative and below the fold: lazy, so it isn't preloaded ahead of the hero (LCP). */}
      {poster && near && <img src={poster} alt="" aria-hidden decoding="async" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />}
      <video
        ref={ref}
        src={src}
        poster={near ? poster ?? undefined : undefined}
        muted
        loop
        playsInline
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 h-full w-full object-contain"
      >
        <track kind="captions" src="data:text/vtt," srcLang="en" label="No captions" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause video' : 'Play video'}
        className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {playing ? <Pause className="h-4 w-4" fill="currentColor" aria-hidden /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />}
      </button>
    </div>
  );
}
