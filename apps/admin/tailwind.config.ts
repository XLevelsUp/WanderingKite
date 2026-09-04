import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Shadcn/UI semantic tokens ────────────────────────────────────────
        // All reference CSS variables injected by ThemeProvider from brand.config.ts.
        // The `<alpha-value>` placeholder enables opacity modifiers:
        //   bg-primary/50, text-accent/75, border-ring/30, etc.
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',

        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',

        // ── Extended brand tokens ────────────────────────────────────────────
        neutral: {
          DEFAULT: 'hsl(var(--color-neutral) / <alpha-value>)',
          foreground: 'hsl(var(--color-neutral-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success) / <alpha-value>)',
          foreground: 'hsl(var(--color-success-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning) / <alpha-value>)',
          foreground: 'hsl(var(--color-warning-foreground) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error) / <alpha-value>)',
          foreground: 'hsl(var(--color-error-foreground) / <alpha-value>)',
        },
        surface: {
          '1': 'hsl(var(--color-surface-1) / <alpha-value>)',
          '2': 'hsl(var(--color-surface-2) / <alpha-value>)',
        },

        // ── Chart palette ────────────────────────────────────────────────────
        chart: {
          '1': 'hsl(var(--chart-1) / <alpha-value>)',
          '2': 'hsl(var(--chart-2) / <alpha-value>)',
          '3': 'hsl(var(--chart-3) / <alpha-value>)',
          '4': 'hsl(var(--chart-4) / <alpha-value>)',
          '5': 'hsl(var(--chart-5) / <alpha-value>)',
        },
      },

      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        // References the --font-sans CSS var injected by ThemeProvider.
        // Fallbacks ensure text is always readable during font load.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      // ── Border radius ──────────────────────────────────────────────────────
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        button: 'var(--radius-button)',
        card: 'var(--radius-card)',
      },

      // ── Shadows ────────────────────────────────────────────────────────────
      // Primary-tinted shadows using brand color (replaces hardcoded gold)
      boxShadow: {
        'brand-sm': '0 0 16px hsl(var(--primary) / 0.18)',
        'brand-md': '0 8px 32px hsl(var(--primary) / 0.22)',
        'brand-lg': '0 20px 60px hsl(var(--primary) / 0.28)',
        'brand-glow':
          '0 0 40px hsl(var(--primary) / 0.14), 0 0 80px hsl(var(--primary) / 0.06)',
      },

      // ── Background gradients ───────────────────────────────────────────────
      backgroundImage: {
        'gradient-brand':
          'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 60%, hsl(var(--chart-5)) 100%)',
        'gradient-hero':
          'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--foreground)) 40%, hsl(var(--primary)) 75%, hsl(var(--chart-5)) 100%)',
        'gradient-surface':
          'linear-gradient(to bottom, hsl(var(--color-surface-2)), hsl(var(--background)))',
      },

      // ── Animations ─────────────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)' },
          '50%': { boxShadow: '0 0 0 8px hsl(var(--primary) / 0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'pulse-brand': 'pulseBrand 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
