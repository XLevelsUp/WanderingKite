// components/services/ServiceCard.tsx
'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
// Import the necessary icons for mapping
import { ArrowRight, Building2, Camera, Mic, Video } from 'lucide-react';

// Define the mapping on the client side to avoid serialization issues
const ICON_MAP = {
  studio: Building2,
  camera: Camera,
  podcast: Mic,
  video: Video,
};

interface ServiceCardProps {
  title: string;
  description: string;
  iconName: keyof typeof ICON_MAP; // Use the map key instead of the component
  href: string;
  tagline?: string;
  features?: string[];
  badge?: string;
  delay?: number;
}

export function ServiceCard({
  title,
  description,
  iconName,
  href,
  tagline,
  features = [],
  badge,
  delay = 0,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = ICON_MAP[iconName]; // Resolve the component locally

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty(
      '--mouse-x',
      `${e.clientX - rect.left}px`
    );
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -10,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      className="group spotlight-card h-full"
      onMouseMove={handleMouseMove}
      style={
        { '--mouse-x': '-400px', '--mouse-y': '-400px' } as React.CSSProperties
      }
    >
      <div
        ref={cardRef}
        // Porcelain mist card on a porcelain white page; sandstone border carries the edge.
        className="
          relative flex h-full flex-col overflow-hidden rounded-2xl
          border border-border
          bg-card
          transition-all duration-300 ease-out
          group-hover:border-neutral
          group-hover:shadow-[0_20px_60px_var(--tw-shadow-color)]
          group-hover:[--tw-shadow-color:hsl(var(--color-surface-2)/0.45)]
        "
      >
        <div className="absolute inset-x-0 top-0 h-px z-10 bg-gradient-to-r from-transparent via-neutral to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-70" />

        <div className="relative z-10 flex h-full flex-col p-7">
          {badge && (
            // Sandstone badge, black label — orange on sandstone measures 1.68:1.
            <span className="mb-4 self-start rounded-full bg-neutral px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
              {badge}
            </span>
          )}

          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral transition-all duration-300 group-hover:bg-secondary">
            {Icon && (
              <Icon
                className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.5}
              />
            )}
          </div>

          {tagline && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-text opacity-75">
              {tagline}
            </p>
          )}

          <h3 className="mb-3 text-xl font-semibold leading-snug text-foreground transition-all duration-300 ">
            {title}
          </h3>

          <p className="mb-5 flex-1 text-sm leading-relaxed text-foreground/65">
            {description}
          </p>

          {features.length > 0 && (
            <ul className="mb-6 space-y-2">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-xs text-foreground/60"
                >
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-primary opacity-70" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto border-t border-border pt-5">
            <Link
              href={href}
              aria-label={`Explore ${title} services by Wandering Kite Studio`}
              className="group/btn inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/85 hover:shadow-[0_8px_24px_hsl(var(--primary)/0.35)]"
            >
              Explore {title}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
