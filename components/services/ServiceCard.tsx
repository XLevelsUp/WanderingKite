'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  tagline?: string;
  features?: string[];
  badge?: string;
  delay?: number;
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
  href,
  tagline,
  features = [],
  badge,
  delay = 0,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Spotlight: update --mouse-x/y CSS vars on the card element
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty(
      '--mouse-x',
      `${e.clientX - rect.left}px`,
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
      className='group spotlight-card h-full'
      onMouseMove={handleMouseMove}
      style={
        { '--mouse-x': '-400px', '--mouse-y': '-400px' } as React.CSSProperties
      }
    >
      <div
        ref={cardRef}
        className='
          relative flex h-full flex-col overflow-hidden rounded-2xl
          border border-primary/15
          bg-[rgba(17,17,22,0.80)] backdrop-blur-md
          transition-all duration-300 ease-out
          group-hover:border-primary/42
          group-hover:shadow-[0_20px_60px_var(--tw-shadow-color)]
          group-hover:[--tw-shadow-color:hsl(var(--primary)/0.22)]
        '
      >
        {/* Top shimmer line on hover */}
        <div
          className='
          absolute inset-x-0 top-0 h-px z-10
          bg-gradient-to-r from-transparent via-primary to-transparent
          opacity-0 transition-opacity duration-500 group-hover:opacity-50
        '
        />

        {/* Inner navy glow bleed */}
        <div
          className='
          pointer-events-none absolute inset-0 rounded-2xl
          bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(46,49,69,0.45),transparent)]
        '
        />

        <div className='relative z-10 flex h-full flex-col p-7'>
          {/* Badge */}
          {badge && (
            <span
              className='
              mb-4 self-start rounded-full border border-primary/28
              bg-primary/10 px-3 py-1
              text-[10px] font-semibold uppercase tracking-[0.18em] text-primary
            '
            >
              {badge}
            </span>
          )}

          {/* Icon */}
          <div
            className='
            mb-5 flex h-12 w-12 items-center justify-center rounded-xl
            border border-primary/18 bg-primary/8
            transition-all duration-300
            group-hover:border-primary/40
            group-hover:bg-primary/16
            group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.18)]
          '
          >
            <Icon
              className='h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110'
              strokeWidth={1.5}
            />
          </div>

          {/* Tagline */}
          {tagline && (
            <p className='mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary opacity-75'>
              {tagline}
            </p>
          )}

          {/* Title */}
          <h3
            className='
            mb-3 text-xl font-semibold leading-snug text-white
            transition-all duration-300 group-hover:text-gradient-gold
          '
          >
            {title}
          </h3>

          {/* Description */}
          <p className='mb-5 flex-1 text-sm leading-relaxed text-foreground/65'>
            {description}
          </p>

          {/* Feature bullets */}
          {features.length > 0 && (
            <ul className='mb-6 space-y-2'>
              {features.map((f) => (
                <li
                  key={f}
                  className='flex items-center gap-2.5 text-xs text-foreground/60'
                >
                  <span className='h-1 w-1 flex-shrink-0 rounded-full bg-primary opacity-70' />
                  {f}
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <div className='mt-auto border-t border-primary/10 pt-5'>
            <Link
              href={href}
              className='
                group/btn inline-flex items-center gap-2 rounded-xl
                border border-primary/28 bg-primary/6
                px-5 py-2.5 text-sm font-medium text-primary
                transition-all duration-200
                hover:border-primary/55 hover:bg-primary/16
                hover:text-white hover:shadow-[0_0_16px_hsl(var(--primary)/0.20)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
              '
            >
              Explore
              <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5' />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
