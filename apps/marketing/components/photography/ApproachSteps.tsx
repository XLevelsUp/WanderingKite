'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Camera, Clock, MapPin } from 'lucide-react';

// "Our Approach" copy, unchanged from the original page.
const POINTS = [
  {
    icon: Camera,
    title: 'Authentic Storytelling',
    body: 'Recognized among the Top 10 photographers in Coimbatore, we capture genuine emotions. Whether you are looking for the best wedding photographers in Coimbatore or creative portraits, we bring your unique story to life.',
  },
  {
    icon: Clock,
    title: 'Reliable Quality',
    body: 'Our team delivers professionally edited images within 7-10 days from our prime RS Puram location. We provide transparent photography packages Coimbatore price options to suit your exact needs.',
  },
  {
    icon: MapPin,
    title: 'Regional Coverage',
    body: 'From our RS Puram location, we serve clients across Coimbatore, Tiruppur, Salem, and Erode with professional wedding, event, portrait, and commercial photography.',
  },
];

/** Three principles; the one crossing the middle of the screen is "active" (lg dims the rest, a rail fills down to it). */
export function ApproachSteps() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <ol className="mt-8">
      {POINTS.map((p, i) => {
        const on = i === active;
        return (
          <li
            key={p.title}
            ref={(el) => { refs.current[i] = el; }}
            data-i={i}
            data-reveal
            style={{ '--d': `${200 + i * 120}ms` } as CSSProperties}
            // Static className: React rewrites className on re-render, which would strip PhotoMotion's .is-in.
            className="relative pb-8 pl-6 last:pb-0 sm:pl-8"
          >
            {/* Progress rail: filled for every principle up to and including the active one. */}
            <span aria-hidden className="absolute bottom-0 left-0 top-0 w-0.5 rounded-full bg-primary/15">
              <span className={`absolute inset-0 origin-top rounded-full bg-gradient-to-b from-[#CBB9A4] via-primary to-primary-deep transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${i <= active ? 'scale-y-100' : 'scale-y-0'}`} />
            </span>
            <div className={`grid grid-cols-[auto_1fr] gap-x-6 transition-opacity duration-500 sm:gap-x-8 ${on ? 'opacity-100' : 'lg:opacity-50'}`}>
            <span className={`pm-num h-11 w-11 text-xs ${on ? 'is-live' : 'is-off'}`}>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="flex items-center gap-3 pt-1.5 text-xl font-semibold text-foreground sm:text-2xl">
                <p.icon className={`h-5 w-5 shrink-0 transition-colors duration-500 ${on ? 'text-primary-deep' : 'text-foreground/40'}`} aria-hidden />
                {p.title}
              </h3>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-foreground/80">{p.body}</p>
            </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
