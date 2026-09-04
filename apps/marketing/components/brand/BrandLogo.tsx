/**
 * BrandLogo.tsx
 *
 * A brand-aware logo component that reads logo paths from brandConfig.
 * Automatically swaps between light and dark variants using CSS dark: variant.
 *
 * Props:
 *   variant  — "light" | "dark" | "auto" (default: "auto")
 *              "auto" uses CSS to swap logos based on color scheme.
 *   width    — Image width in px (default: 160)
 *   height   — Image height in px (default: 40)
 *   className — Additional CSS classes
 *   priority  — next/image priority prop (set true for above-the-fold logos)
 */

import Image from 'next/image';
import { brandConfig } from '@/config/brand.config';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'auto';
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = 'auto',
  width = 160,
  height = 40,
  className = '',
  priority = false,
}: BrandLogoProps) {
  const { name, assets } = brandConfig;
  const hasLogos = assets.logoLight || assets.logoDark;

  // If no logo assets are configured, fall back to styled text
  if (!hasLogos) {
    return (
      <span
        className={`font-sans font-bold text-primary ${className}`}
        style={{ fontSize: `${height * 0.55}px` }}
      >
        {name}
      </span>
    );
  }

  // Explicit variant — render a single image
  if (variant === 'light') {
    return (
      <Image
        src={assets.logoLight || assets.logoDark}
        alt={`${name} logo`}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  if (variant === 'dark') {
    return (
      <Image
        src={assets.logoDark || assets.logoLight}
        alt={`${name} logo`}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  // "auto" mode — render both and hide/show based on color scheme via CSS
  // The site is forced dark (className="dark" on <html>), so we show light logo.
  // This pattern is future-proof for light mode support.
  return (
    <>
      {/* Light logo: visible in dark mode */}
      <Image
        src={assets.logoLight || assets.logoDark}
        alt={`${name} logo`}
        width={width}
        height={height}
        className={`dark:block hidden ${className}`}
        priority={priority}
      />
      {/* Dark logo: visible in light mode */}
      <Image
        src={assets.logoDark || assets.logoLight}
        alt={`${name} logo`}
        width={width}
        height={height}
        className={`dark:hidden block ${className}`}
        priority={priority}
      />
    </>
  );
}
