'use client';

import { useRef } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// Full stops from closed (f/16) to wide open (f/1.4), shown as the iris opens.
const STOPS = ['f/16', 'f/11', 'f/8', 'f/5.6', 'f/4', 'f/2.8', 'f/2', 'f/1.4'];
const BLADES = 6;
// Palette: taupe and sandstone blades alternating; porcelain seams.
const FILLS = ['#9A8472', '#CBB9A4'];

/* Decorative camera iris that opens as it scrolls through the viewport. */
export function ApertureIris({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Blade offset (= hole apothem in viewBox units): nearly closed → wide open.
  const open = useTransform(scrollYProgress, [0.1, 0.7], reduce ? [40, 40] : [10, 74], { clamp: true });
  const turn = useTransform(scrollYProgress, [0.1, 0.7], reduce ? [0, 0] : [-30, 0], { clamp: true });

  useMotionValueEvent(open, 'change', (v) => {
    if (!labelRef.current) return;
    const i = Math.round(((v - 10) / (74 - 10)) * (STOPS.length - 1));
    labelRef.current.textContent = STOPS[Math.max(0, Math.min(STOPS.length - 1, i))];
  });

  return (
    <div ref={ref} aria-hidden className={className}>
      <div className="relative aspect-square">
        <svg viewBox="-110 -110 220 220" className="h-full w-full overflow-visible">
          <defs>
            <clipPath id="iris-clip">
              <circle r="92" />
            </clipPath>
          </defs>

          {/* Lens barrel: outer ring + 48 ticks. */}
          <circle r="104" fill="none" stroke="hsl(var(--foreground) / 0.12)" strokeWidth="1" />
          {Array.from({ length: 48 }, (_, i) => (
            <line
              key={i}
              x1="0"
              y1={-104}
              x2="0"
              y2={i % 4 === 0 ? -98 : -101}
              stroke="hsl(var(--foreground) / 0.25)"
              strokeWidth="1"
              transform={`rotate(${i * 7.5})`}
            />
          ))}
          <circle r="92" fill="hsl(var(--background))" stroke="hsl(var(--foreground) / 0.18)" strokeWidth="1.5" />

          <g clipPath="url(#iris-clip)">
            <motion.g style={{ rotate: turn, transformBox: 'view-box', transformOrigin: 'center' }}>
              {Array.from({ length: BLADES }, (_, i) => (
                <g key={i} transform={`rotate(${(360 / BLADES) * i})`}>
                  <motion.g style={{ x: open }}>
                    <rect x="0" y="-150" width="220" height="300" transform="rotate(18)" fill={FILLS[i % 2]} stroke="#FAF9F6" strokeWidth="1.5" />
                  </motion.g>
                </g>
              ))}
            </motion.g>
          </g>

          {/* Inner glint ring */}
          <circle r="92" fill="none" stroke="hsl(var(--background) / 0.6)" strokeWidth="2" />
        </svg>

        {/* f-stop readout, bottom-right like a lens marking */}
        <span
          ref={labelRef}
          className="absolute -bottom-1 right-0 text-[11px] font-semibold tabular-nums tracking-[0.2em] text-accent-text"
        >
          {reduce ? 'f/4' : 'f/16'}
        </span>
      </div>
    </div>
  );
}
