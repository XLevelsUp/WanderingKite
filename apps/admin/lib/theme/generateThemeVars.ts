/**
 * generateThemeVars.ts
 *
 * Converts a BrandConfig object into a CSS :root { ... } string.
 * Used by ThemeProvider to inject CSS variables before first paint.
 */

import type { BrandConfig } from '@/config/brand.config';

/**
 * Maps a BrandConfig to a CSS custom properties string.
 * Output is injected as a <style> tag in the document <head>.
 */
export function generateThemeVars(config: BrandConfig): string {
  const c = config.colors;
  const r = config.radius;
  const t = config.typography;

  const vars: Record<string, string> = {
    // ── Shadcn/UI semantic tokens ─────────────────────────────────────────
    '--background': c.background,
    '--foreground': c.foreground,

    '--card': c.card,
    '--card-foreground': c.cardForeground,

    '--popover': c.popover,
    '--popover-foreground': c.popoverForeground,

    '--primary': c.primary,
    '--primary-foreground': c.primaryForeground,

    '--secondary': c.secondary,
    '--secondary-foreground': c.secondaryForeground,

    '--muted': c.muted,
    '--muted-foreground': c.mutedForeground,

    '--accent': c.accent,
    '--accent-foreground': c.accentForeground,

    '--destructive': c.destructive,
    '--destructive-foreground': c.destructiveForeground,

    '--border': c.border,
    '--input': c.input,
    '--ring': c.ring,

    // ── Chart tokens ──────────────────────────────────────────────────────
    '--chart-1': c.chart1,
    '--chart-2': c.chart2,
    '--chart-3': c.chart3,
    '--chart-4': c.chart4,
    '--chart-5': c.chart5,

    // ── Extended brand tokens ─────────────────────────────────────────────
    '--color-neutral': c.neutral,
    '--color-neutral-foreground': c.neutralForeground,

    '--color-success': c.success,
    '--color-success-foreground': c.successForeground,
    '--color-warning': c.warning,
    '--color-warning-foreground': c.warningForeground,
    '--color-error': c.error,
    '--color-error-foreground': c.errorForeground,

    '--color-surface-1': c.surface1,
    '--color-surface-2': c.surface2,

    // ── Radius tokens ─────────────────────────────────────────────────────
    '--radius': r.default,
    '--radius-button': r.button,
    '--radius-card': r.card,

    // ── Typography tokens ─────────────────────────────────────────────────
    '--font-sans': t.fontSans,
    '--font-mono': t.fontMono,
  };

  const declarations = Object.entries(vars)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');

  return `:root {\n${declarations}\n}`;
}
