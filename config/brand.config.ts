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
    'Photography, camera & equipment rentals, 1200 sq ft studio & podcast recording in RS Puram, Coimbatore. 4.9★ on Google. 500+ projects delivered.',
  url: 'https://wanderingkite.in',

  colors: {
    // /* --- PREVIOUS COLOR TEMPLATE (Electric Blue) --- */
    primary: '217 91% 60%',
    primaryForeground: '0 0% 100%',

    // Secondary: navy surface
    secondary: '240 8% 10%',
    secondaryForeground: '0 0% 98%',

    // Accent: matches secondary (used for hover states)
    accent: '240 8% 10%',
    accentForeground: '217 91% 60%',

    /* --- NEW COLOR TEMPLATE (Orange-Red) ---
     primary: '19 100% 50%',
    primaryForeground: '0 0% 100%',
    secondary: '240 8% 10%',
    secondaryForeground: '0 0% 98%',
    accent: '240 8% 10%',
    accentForeground: '20 100% 50%',
    */
    

    // Muted
    muted: '240 8% 10%',
    mutedForeground: '215 20% 65%',

    // Neutral
    neutral: '240 6% 15%',
    neutralForeground: '0 0% 90%',

    // Destructive
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '0 0% 98%',

    // Status
    success: '142 71% 45%',
    successForeground: '0 0% 98%',
    warning: '38 92% 50%',
    warningForeground: '240 6% 4%',
    error: '0 84% 60%',
    errorForeground: '0 0% 98%',

    // Page backgrounds
    background: '240 6% 4%',
    foreground: '0 0% 98%',

    // Card / popover
    card: '240 8% 7%',
    cardForeground: '0 0% 98%',
    popover: '240 8% 7%',
    popoverForeground: '0 0% 98%',

    // Surface layers
    surface1: '240 8% 7%',
    surface2: '240 8% 10%',

    // Form
    border: '240 8% 14%',
    input: '240 8% 14%',
    ring: '217 91% 60%',

    // Charts
    chart1: '217 91% 60%',
    chart2: '230 25% 41%',
    chart3: '210 40% 70%',
    chart4: '230 25% 55%',
    chart5: '217 91% 70%',
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
    ogImage: 'https://wanderingkite.in/og-image.jpg',
  },
};
