import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { LegalToc } from './LegalToc';
import { siteConfig } from '@/config/site';

export type LegalSection = { id: string; title: string; body: ReactNode };

const WRAP = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16';

// Body typography via descendant selectors (the typography plugin isn't installed, so `prose` did nothing).
const BODY =
  'text-base leading-relaxed text-foreground/80 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-primary [&_a]:underline-offset-4 [&_a:hover]:decoration-foreground [&_h3]:mt-6 [&_h3:first-child]:mt-0 [&_h3+p]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:pl-1 [&_p+p]:mt-4 [&_p+ul]:mt-4 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul+p]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-primary';

// Sidebar links follow the footer rules: Rental Terms only while rentals are switched on.
const RELATED = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/photography-terms', label: 'Photography Terms' },
  { href: '/studio-rules', label: 'Studio Terms' },
  ...(siteConfig.features.rentals ? [{ href: '/terms', label: 'Rental Terms' }] : []),
];

/** Legal page: title band, sticky contents (lg) / collapsible contents (mobile), numbered sections, footer. `studio` switches to the dark studio palette. */
export function LegalPage({ title, updated, sections, current, studio = false }: { title: string; updated: string; sections: LegalSection[]; current: string; studio?: boolean }) {
  const toc = sections.map(({ id, title }) => ({ id, title }));

  return (
    <div data-theme={studio ? 'studio' : undefined} className="bg-background text-foreground">
      <main>
        {/* Title band — top padding = 80px header + 32/48/64px. */}
        <header className="border-b border-border">
          <div className={`${WRAP} pb-12 pt-28 sm:pt-32 lg:pb-16 lg:pt-36`}>
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-2">
                <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                <li aria-hidden>/</li>
                <li>Legal</li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-foreground">{title}</li>
              </ol>
            </nav>
            <h1 className="mt-6 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{title}</h1>
            <p className="mt-4 text-sm text-muted-foreground">{updated}</p>
          </div>
        </header>

        <div className={`${WRAP} grid gap-8 py-12 sm:py-16 lg:grid-cols-12 lg:gap-16 lg:py-20`}>
          {/* Contents: collapsible on phones/tablets, sticky sidebar from lg. */}
          <aside className="lg:col-span-3">
            <details className="group rounded-2xl border border-border bg-card p-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                On this page
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" aria-hidden />
              </summary>
              <div className="mt-4"><LegalToc items={toc} /></div>
            </details>
            <div className="hidden lg:sticky lg:top-28 lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">On this page</p>
              <div className="mt-4"><LegalToc items={toc} /></div>
              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Legal</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {RELATED.map((r) => (
                    <li key={r.href}>
                      <Link href={r.href} aria-current={r.href === current ? 'page' : undefined} className={r.href === current ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}>
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <article className="max-w-3xl lg:col-span-9">
            {sections.map((s, n) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-0 last:pb-0">
                <h2 id={`${s.id}-h`} className="flex items-baseline gap-4 text-xl font-bold tracking-tight sm:text-2xl">
                  <span className="text-sm font-semibold tabular-nums text-accent-text">{String(n + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                <div className={`mt-4 ${BODY}`}>{s.body}</div>
              </section>
            ))}
          </article>
        </div>
      </main>
      {studio ? <Footer account="studio" showInstagram={false} /> : <Footer showInstagram={false} tone="sandstone" />}
    </div>
  );
}

/** Highlighted card for key clauses (light mist surface, taupe rule). */
export function LegalCallout({ children }: { children: ReactNode }) {
  return <div className="mt-4 rounded-r-xl border-l-4 border-primary bg-card px-6 py-4 text-foreground">{children}</div>;
}
