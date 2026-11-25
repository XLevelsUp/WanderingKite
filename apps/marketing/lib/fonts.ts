import localFont from 'next/font/local';
import { Quicksand } from 'next/font/google';

/**
 * Editorial serif (Cormorant Garamond, OFL) for story names and album covers.
 * Self-hosted from app/fonts rather than next/font/google: Google serves this family from `l/font?kit=…` URLs
 * that Turbopack (`npm run dev`) can't resolve ("next/font/google queries have exactly one entry").
 * Latin 500/600 from Fontsource — the same weights the site used before.
 */
export const storySerif = localFont({
  src: [
    { path: '../app/fonts/cormorant-garamond-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../app/fonts/cormorant-garamond-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

/** Quicksand Regular (400) for the "Stories in Light" brand tagline. */
export const storiesFont = Quicksand({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});
