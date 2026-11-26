/**
 * brand.config.ts — Single Source of Truth for all brand identity.
 *
 * HOW TO WHITE-LABEL THIS APP:
 *   1. Edit the `brandConfig` object below.
 *   2. All colors, radii, fonts, and logo paths update automatically.
 *   3. No .tsx or .css files need to be touched.
 *
 * COLOR FORMAT:
 *   All colors must be raw HSL values WITHOUT the hsl() wrapper.
 *   e.g.  "42 35% 63%"  NOT  "hsl(42, 35%, 63%)"
 *   This enables Tailwind opacity modifiers: bg-primary/50, text-accent/75, etc.
 */

// ─── Type Definitions ─────────────────────────────────────────────────────────

/** A raw HSL string without the hsl() wrapper. e.g. "42 35% 63%" */
type HslValue = string;

export interface BrandColors {
  /** Primary brand color — used for CTAs, active states, highlights */
  primary: HslValue;
  /** Text/icon rendered on the primary color */
  primaryForeground: HslValue;

  /** Secondary color — used for secondary buttons, chips */
  secondary: HslValue;
  secondaryForeground: HslValue;

  /** Accent — subtle highlights, borders, special elements */
  accent: HslValue;
  accentForeground: HslValue;

  /** Brand orange, for sub-headings only — separate from `primary` (buttons). */
  accentText: HslValue;

  /** Muted — low-emphasis backgrounds and text */
  muted: HslValue;
  mutedForeground: HslValue;

  /** Neutral — a grayscale palette for UI structure */
  neutral: HslValue;
  neutralForeground: HslValue;

  /** Destructive / error UI state */
  destructive: HslValue;
  destructiveForeground: HslValue;

  /** Status colors */
  success: HslValue;
  successForeground: HslValue;
  warning: HslValue;
  warningForeground: HslValue;
  error: HslValue;
  errorForeground: HslValue;

  /** Page-level backgrounds */
  background: HslValue;
  foreground: HslValue;

  /** Card / popover surfaces */
  card: HslValue;
  cardForeground: HslValue;
  popover: HslValue;
  popoverForeground: HslValue;

  /** Surface layers (z-axis elevation) */
  surface1: HslValue;
  surface2: HslValue;

  /** Form elements */
  border: HslValue;
  input: HslValue;
  ring: HslValue;

  /** Chart accent palette (5 colors for data visualizations) */
  chart1: HslValue;
  chart2: HslValue;
  chart3: HslValue;
  chart4: HslValue;
  chart5: HslValue;
}

export interface BrandRadius {
  /** Global default radius (used for lg in Tailwind) */
  default: string;
  /** Radius applied to buttons */
  button: string;
  /** Radius applied to cards and panels */
  card: string;
}

export interface BrandTypography {
  /** CSS font-family string for the primary sans-serif font.
   *  Make sure the font is loaded in app/layout.tsx via next/font. */
  fontSans: string;
  /** CSS font-family string for monospaced text */
  fontMono: string;
}

export interface BrandAssets {
  /** Path to logo for use on dark/colored backgrounds (light logo) */
  logoLight: string;
  /** Path to logo for use on light backgrounds (dark logo) */
  logoDark: string;
  /** Path to favicon — must be in /public */
  favicon: string;
  /** OpenGraph / Twitter card image */
  ogImage: string;
}

export interface BrandConfig {
  /** Display name of the studio / brand */
  name: string;
  /** SEO description for meta tags */
  description: string;
  /** Canonical URL of the site */
  url: string;
  colors: BrandColors;
  radius: BrandRadius;
  typography: BrandTypography;
  assets: BrandAssets;
}

// ─── Active Brand Configuration ───────────────────────────────────────────────
// Edit ONLY the values below to rebrand the entire application.

export const brandConfig: BrandConfig = {
  name: 'Wandering Kite',
  description:
    'Photography, camera & equipment rentals, 1200 sq ft studio & podcast recording in RS Puram, Coimbatore. 5★ on Google. 500+ projects delivered.',
  url: 'https://www.wanderingkite.in',

  /* ─── LIGHT BRAND PALETTE ──────────────────────────────────────────────
   *   Porcelain white  #FAF9F6  page background      Warm taupe  #9A8472  buttons/CTAs
   *   Porcelain mist   #F4F1EA  cards (lighter)      Brand orange #FF5500  sub-headings
   *   Soft sandstone   #CBB9A4  cards (heavier)      Black       #000000  all text
   *   Sandy beige      #C8B39A  fills, dividers
   *
   * Elevation comes from choosing mist vs sandstone — never from tinting orange.
   * Measured: black-on-taupe 5.92, orange-on-porcelain 3.04, orange-on-sandstone
   * 1.68 (so sandstone cards take black sub-headings, not orange).
   * ──────────────────────────────────────────────────────────────────── */
  colors: {
    // Warm taupe — every button and CTA. Black text sits on it (5.92:1).
    primary: '27 17% 53%',
    primaryForeground: '0 0% 0%',

    // Secondary: sandy beige fills, black text on top for contrast.
    secondary: '33 29% 69%',
    secondaryForeground: '0 0% 0%',

    // Accent: porcelain mist, used for hover/active surfaces.
    accent: '42 31% 94%',
    accentForeground: '0 0% 0%',

    // Brand orange — sub-headings and second lines of copy ONLY.
    accentText: '20 100% 50%',

    // Muted: mist surface. Muted text is black at reduced opacity rather
    // than a grey, so secondary copy stays inside the palette.
    muted: '42 31% 94%',
    mutedForeground: '27 15% 40%',

    // Neutral: soft sandstone structure — the heavier card surface.
    neutral: '32 27% 72%',
    neutralForeground: '0 0% 0%',

    // Destructive
    destructive: '0 72% 45%',
    destructiveForeground: '0 0% 100%',

    // Status — functional, not brand. Darkened for legibility on porcelain.
    success: '142 64% 34%',
    successForeground: '0 0% 100%',
    warning: '32 90% 42%',
    warningForeground: '0 0% 100%',
    error: '0 72% 45%',
    errorForeground: '0 0% 100%',

    // Page: porcelain white, black text.
    background: '45 29% 97%',
    foreground: '0 0% 0%',

    // Card / popover: porcelain mist, one step up from the page.
    card: '42 31% 94%',
    cardForeground: '0 0% 0%',
    popover: '42 31% 94%',
    popoverForeground: '0 0% 0%',

    // Surface layers
    surface1: '42 31% 94%',
    surface2: '32 27% 72%',

    // Focus ring stays orange: taupe on sandstone would be invisible to keyboard users.
    border: '32 27% 72%',
    input: '32 27% 72%',
    ring: '20 100% 50%',

    // Charts — the palette's warm range, orange through taupe.
    chart1: '20 100% 50%',
    chart2: '27 17% 53%',
    chart3: '33 29% 69%',
    chart4: '32 27% 72%',
    chart5: '20 60% 65%',
  },

  radius: {
    default: '21px',
    button: '0.5rem',
    card: '0.75rem',
  },

  typography: {
    // Font must be loaded in app/layout.tsx via next/font/google
    fontSans: 'Inter, system-ui, sans-serif',
    fontMono: 'monospace',
  },

  assets: {
    // Place logo files in /public and update these paths
    logoLight: '/logo-light.svg',
    logoDark: '/logo-dark.svg',
    favicon: '/favicon.ico',
    ogImage: 'https://www.wanderingkite.in/og-image.jpg',
  },
};
