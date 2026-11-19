import Link from 'next/link';
import { ChevronRight, MapPin, MessageCircle, Phone } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';
import type { Category } from '@/lib/photography/data';

/** Same container width steps as the landing and studio pages. */
export const PHOTO_WRAP = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16';

/** Page headings where "<name> Photography" reads badly; others fall back to that pattern (new DB categories just work). */
const HEADINGS: Record<string, string> = {
  muslim: 'Muslim Wedding Photography',
  hindu: 'Hindu Wedding Photography',
  christian: 'Christian Wedding Photography',
  telugu: 'Telugu Wedding Photography',
  'baby-shoots': 'Baby Photoshoots',
  'baby-bumps': 'Maternity & Baby Bump Photography',
  toddlers: 'Toddler Photography',
  'bridal-portraits': 'Bridal Portrait Photography',
  'couple-portraits': 'Couple Portrait Photography',
  'groom-portraits': 'Groom Portrait Photography',
  'candid-moments': 'Candid Wedding Moments',
  'pre-wedding': 'Pre-wedding Outdoor Photography',
  'post-wedding': 'Post-wedding Outdoor Photography',
  'corporate-events': 'Corporate Event Photography',
  'conferences-seminars': 'Conference & Seminar Photography',
  'product-launches': 'Product Launch Photography',
  headshots: 'Corporate Headshots',
  'product-photography': 'Product Photography',
  'ads-commercials': 'Ad & Commercial Production',
  'music-videos': 'Music Video Production',
  'short-films': 'Short Film Production',
};
export const categoryHeading = (c: Pick<Category, 'slug' | 'name' | 'group_slug'>) =>
  HEADINGS[c.slug] ?? (/photograph|production/i.test(c.name) ? c.name : `${c.name} Photography`);

/** Breadcrumb trail; last item is the current page. */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />}
            {it.href ? (
              <Link href={it.href} className="transition-colors hover:text-foreground">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Closing booking band: WhatsApp (solid CTA) + call (outline). `message` pre-fills WhatsApp with the page's context. */
export function BookingBand({ title, subtitle, message }: { title: string; subtitle: string; message: string }) {
  const tel = `tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`;
  return (
    <section aria-label="Book a shoot" className="border-t border-border">
      <div className={`${PHOTO_WRAP} py-16 sm:py-20`}>
        <div className="reveal flex flex-col gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
            <p className="mt-4 text-base text-foreground/80">{subtitle}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row lg:shrink-0">
            <a
              href={generateWhatsAppLink('photography', message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Check your date on WhatsApp
            </a>
            <a
              href={tel}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/30 px-6 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {siteConfig.contact.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Where we shoot" band: links to each city landing page. */
export function CitiesBand({ cities, title = 'Based in Coimbatore, booked across the south' }: { cities: { slug: string; name: string }[]; title?: string }) {
  return (
    <section aria-labelledby="cities-heading" className="border-t border-border">
      <div className={`${PHOTO_WRAP} flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Where we shoot</p>
          <h2 id="cities-heading" className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
        </div>
        <ul className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/photography/wedding-photographer-in-${c.slug}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
