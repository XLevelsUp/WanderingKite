import Link from 'next/link';
import { MapPin } from 'lucide-react';

type Tab = { href: string; label: string; active: boolean };

const pill = (active: boolean) =>
  `inline-flex h-10 shrink-0 snap-start items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    active ? 'border-cta bg-cta text-cta-foreground' : 'border-border text-foreground hover:border-foreground'
  }`;

/** Category tabs (real links, like the reference). One swipeable row on phones/tablets; wraps on desktop. */
export function CategoryTabs({ tabs, label = 'Categories' }: { tabs: Tab[]; label?: string }) {
  return (
    <nav aria-label={label} className="-mx-5 sm:-mx-8 lg:mx-0">
      {/* Edge fade hints at more tabs off-screen on small screens. */}
      <ul className="flex snap-x gap-2 overflow-x-auto px-5 pb-2 [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)] [scrollbar-width:none] sm:px-8 lg:flex-wrap lg:overflow-visible lg:px-0 lg:[mask-image:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link href={t.href} aria-current={t.active ? 'page' : undefined} className={pill(t.active)} scroll={false}>
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** City filter chips (?city=…). Plain links: crawlable, work without JS, keep the URL shareable. */
export function CityFilter({ cities, active, hrefFor }: { cities: { slug: string; name: string }[]; active: string | null; hrefFor: (city: string | null) => string }) {
  return (
    <nav aria-label="Filter by city" className="-mx-5 sm:-mx-8 lg:mx-0">
      <ul className="flex snap-x items-center gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:px-8 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        <li className="flex shrink-0 items-center gap-1 pr-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> City
        </li>
        <li>
          <Link href={hrefFor(null)} aria-current={!active ? 'true' : undefined} className={pill(!active)} scroll={false}>
            All
          </Link>
        </li>
        {cities.map((c) => (
          <li key={c.slug}>
            <Link href={hrefFor(c.slug)} aria-current={active === c.slug ? 'true' : undefined} className={pill(active === c.slug)} scroll={false}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
