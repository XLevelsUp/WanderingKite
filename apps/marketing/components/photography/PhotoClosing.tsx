import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { termsData } from '@/lib/service-terms';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/**
 * Closing band (sand tone, leads into the sandstone footer): where we shoot + booking CTA, then the photography
 * service agreement as three ruled columns instead of a scroll box. Copy is unchanged from CitiesBand / ServiceTerms.
 */
export function PhotoClosing({ cities, wrap }: { cities: { slug: string; name: string }[]; wrap: string }) {
  const terms = termsData.photography;
  return (
    <section aria-labelledby="cities-heading" data-tone="sand">
      <div className={`${wrap} py-16 sm:py-20 lg:py-24`}>
        {/* ── Where we shoot ── */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div data-reveal className="lg:col-span-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Where we shoot</p>
            <h2 id="cities-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Based in Coimbatore, booked across the south
            </h2>
            <a
              href={generateWhatsAppLink('photography')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Book a Session with Wandering Kite Photography on WhatsApp"
              className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Book a Session
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>
          <ul className="flex flex-wrap gap-2 lg:col-span-6 lg:justify-end">
            {cities.map((c, i) => (
              <li key={c.slug} data-reveal style={d(100 + i * 50)}>
                <Link
                  href={`/photography/wedding-photographer-in-${c.slug}`}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-foreground/25 bg-card px-4 text-sm font-medium text-foreground transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Service agreement ── */}
        <div className="relative mt-16 pt-12 lg:mt-20">
          <span aria-hidden data-reveal="line" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />
          <h2 data-reveal className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{terms.header}</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3 lg:gap-12">
            {terms.items.map((t, i) => (
              <li key={t.title} data-reveal style={d(150 + i * 120)}>
                <span className="pm-num h-10 w-10 text-[11px]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{t.details}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-xs italic text-foreground/60">*By proceeding with a booking, you agree to the terms outlined above.</p>
        </div>
      </div>
    </section>
  );
}
