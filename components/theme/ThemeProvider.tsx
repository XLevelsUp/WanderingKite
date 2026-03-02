/**
 * ThemeProvider.tsx
 *
 * A Server Component that injects brand CSS variables into the document <head>
 * BEFORE the first paint, completely eliminating "Flash of Unstyled Brand" (FOUB).
 *
 * Usage: Place as the first child inside <html> in app/layout.tsx.
 *
 * <html>
 *   <ThemeProvider />    ← must come first
 *   <body>...</body>
 * </html>
 */

import { brandConfig } from '@/config/brand.config';
import { generateThemeVars } from '@/lib/theme/generateThemeVars';

// This is intentionally a Server Component (no "use client").
// CSS variables are static per-brand — no runtime JS needed.
export function ThemeProvider() {
  const css = generateThemeVars(brandConfig);

  return (
    <style
      id='brand-theme'
      // nonce can be added here for strict CSP environments
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
