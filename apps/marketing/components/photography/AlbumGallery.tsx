'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { AlbumImage } from '@/lib/photography/data';

/**
 * Uncropped masonry gallery (CSS columns: every photo keeps its own aspect ratio) + full-screen lightbox.
 * First 6 images load eagerly, the rest lazily; lightbox preloads neighbours. No animation library.
 */
export function AlbumGallery({ images, title }: { images: AlbumImage[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  // Closing returns keyboard focus to the photo that was open (also after browsing to another one).
  const close = useCallback(() => {
    setOpen((i) => {
      if (i !== null) requestAnimationFrame(() => thumbs.current[i]?.focus());
      return null;
    });
  }, []);
  const alt = (img: AlbumImage, i: number) => img.alt_text || `${title} — photo ${i + 1}`;

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6 3xl:columns-4">
        {images.map((img, i) => (
          <li key={img.id} className="mb-4 break-inside-avoid lg:mb-6">
            <button
              ref={(el) => { thumbs.current[i] = el; }}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${images.length}`}
              className="group block w-full overflow-hidden rounded-xl bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <img
                src={img.url}
                alt={alt(img, i)}
                loading={i < 6 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] motion-reduce:transition-none"
              />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} alt={alt} />}
    </>
  );
}

function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  alt,
}: {
  images: AlbumImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  alt: (img: AlbumImage, i: number) => string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const n = images.length;
  const step = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);

  // Open: lock page scroll and focus Close; unmount restores scroll (focus return is handled by the gallery).
  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, step]);

  // Preload neighbours so next/prev feel instant.
  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      const img = images[(i + n) % n];
      if (img) new window.Image().src = img.url;
    });
  }, [index, images, n]);

  const img = images[index];
  const ctl =
    'flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${n}`}
      className="fixed inset-0 z-[70] flex flex-col bg-black [animation:lightbox-in_200ms_ease-out] motion-reduce:[animation:none]"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <style>{'@keyframes lightbox-in{from{opacity:0}to{opacity:1}}'}</style>
      <div className="flex items-center justify-between px-4 py-4 sm:px-8" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-semibold uppercase tabular-nums tracking-[0.2em] text-white/70" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={ctl}>
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 sm:px-24">
        {/* key forces a fresh fade per photo; object-contain never crops. */}
        <img
          key={img.id}
          src={img.url}
          alt={alt(img, index)}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-lg object-contain [animation:lightbox-in_250ms_ease-out] motion-reduce:[animation:none]"
        />
        {n > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1); }} className={`${ctl} absolute left-4 top-1/2 hidden -translate-y-1/2 sm:flex sm:left-8`}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1); }} className={`${ctl} absolute right-4 top-1/2 hidden -translate-y-1/2 sm:flex sm:right-8`}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}
      </div>
      {n > 1 && <p className="pb-6 text-center text-xs text-white/50 sm:hidden">Swipe to browse</p>}
    </div>
  );
}
