'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';

/* Page-wide, photography-inspired motion for the landing page (CSS lives in globals.css). */
export function LandingMotion() {
  const { scrollYProgress } = useScroll();
  const finderRef = useRef<HTMLDivElement>(null);

  // ── Scroll reveals ─────────────────────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('js-motion');

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    const scan = () => {
      document.querySelectorAll('main > section:not(:first-of-type) h2').forEach((h) => {
        if (!h.hasAttribute('data-focus')) {
          h.setAttribute('data-focus', '');
          io.observe(h);
        }
      });
      document.querySelectorAll('[data-shutter]:not(.is-in)').forEach((el) => io.observe(el));
    };
    scan();
    const late = window.setTimeout(scan, 1500); // content that mounts late (Instagram feed)

    return () => {
      window.clearTimeout(late);
      io.disconnect();
      root.classList.remove('js-motion');
    };
  }, []);

  // ── Pointer interactions ───────────────────────────────────────────────
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finder = finderRef.current;
    if (!fine || reduce || !finder) return;

    let raf = 0;
    let px = -100, py = -100; // latest pointer
    let fx = -100, fy = -100; // viewfinder (eased)
    let target: Element | null = null; // event target of the latest move
    let photo: HTMLElement | null = null; // photo currently under the pointer
    let magnet: HTMLElement | null = null; // magnetic CTA currently engaged

    const releasePhoto = () => {
      if (!photo) return;
      photo.querySelectorAll<HTMLElement>('img').forEach((img) => (img.style.translate = ''));
      photo = null;
      finder.dataset.on = 'false';
    };
    const releaseMagnet = () => {
      if (magnet) magnet.style.translate = '';
      magnet = null;
    };

    const frame = () => {
      raf = 0;

      // Viewfinder: ease toward the pointer (critically damped feel, no overshoot).
      fx += (px - fx) * 0.22;
      fy += (py - fy) * 0.22;
      finder.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;

      // Photo under pointer → lock-on + lens parallax.
      const p = (target?.closest('[data-shutter]') as HTMLElement | null) ?? null;
      if (p !== photo) {
        releasePhoto();
        if (p) { photo = p; finder.dataset.on = 'true'; }
      }
      if (photo) {
        const r = photo.getBoundingClientRect();
        const nx = (px - r.left) / r.width - 0.5;
        const ny = (py - r.top) / r.height - 0.5;
        photo.querySelectorAll<HTMLElement>('img').forEach((img) => (img.style.translate = `${-nx * 14}px ${-ny * 14}px`));
      }

      // Magnetic CTA: lean up to 6px toward the pointer.
      const m = (target?.closest('[data-magnetic]') as HTMLElement | null) ?? null;
      if (m !== magnet) { releaseMagnet(); magnet = m; }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = (px - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (py - (r.top + r.height / 2)) / (r.height / 2);
        magnet.style.translate = `${dx * 6}px ${dy * 4}px`;
      }

      // Keep easing until the viewfinder has caught up.
      if (Math.abs(px - fx) > 0.5 || Math.abs(py - fy) > 0.5) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY; target = e.target as Element;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => { target = null; releasePhoto(); releaseMagnet(); };
    // Scrolling moves content under a still pointer — re-evaluate what is under it.
    const onScroll = () => {
      if (px < 0) return;
      target = document.elementFromPoint(px, py);
      if (!raf) raf = requestAnimationFrame(frame);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      releasePhoto();
      releaseMagnet();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // White brackets with a dark hairline shadow stay visible on light and dark photos.
const bracket = 'absolute h-3 w-3 border-white drop-shadow-[0_0_1px_rgba(0,0,0,0.9)]';

  return (
    <>
      {/* Exposure line — transform only, driven by native scroll. */}
      <motion.div
        aria-hidden
        style={{ scaleX: scrollYProgress }}
        className="pointer-events-none fixed inset-x-0 top-20 z-40 h-0.5 origin-left bg-accent-text motion-reduce:hidden"
      />

      {/* Viewfinder cursor — hidden until it locks onto a photo (see data-on in globals.css). */}
      <div ref={finderRef} aria-hidden data-on="false" className="viewfinder pointer-events-none fixed left-0 top-0 z-50 hidden [@media(hover:hover)_and_(pointer:fine)]:block">
        <div className="viewfinder-box relative -translate-x-1/2 -translate-y-1/2">
          <span className={`${bracket} left-0 top-0 border-l-2 border-t-2`} />
          <span className={`${bracket} right-0 top-0 border-r-2 border-t-2`} />
          <span className={`${bracket} bottom-0 left-0 border-b-2 border-l-2`} />
          <span className={`${bracket} bottom-0 right-0 border-b-2 border-r-2`} />
        </div>
      </div>
    </>
  );
}
