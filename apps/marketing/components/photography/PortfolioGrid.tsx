import { ArrowRight } from 'lucide-react';
import type { PortfolioPhoto } from '@/lib/photography/data';
import { PortfolioRail } from './PortfolioRail';

/**
 * "Recent work": the lead photo of each of the 10 newest published albums, in one horizontal rail
 * (swipe on phones, arrows on desktop). Fills itself from Admin — publish an album and it appears here
 * within ~5 minutes (the page re-reads the catalog every 5 min). Photos are real <img>s with descriptive
 * alt text, plus a <noscript> copy, so crawlers see the work (audit 2026-11-12: "no portfolio visible").
 */
export function PortfolioGrid({ photos, wrap }: { photos: PortfolioPhoto[]; wrap: string }) {
  if (photos.length === 0) return null;
  return (
    <section id="portfolio" aria-labelledby="portfolio-heading" data-tone="sand" className="scroll-mt-20 overflow-x-clip">
      <div className={`${wrap} py-12 sm:py-16 lg:py-20`}>
        <div data-reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Portfolio</p>
            <h2 id="portfolio-heading" className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Recent work</h2>
            <p className="mt-2 text-base text-foreground/80">Fresh prints from our latest shoots.</p>
          </div>
          <a href="#explore" className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            Browse by category
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </a>
        </div>
        <div className="mt-4 lg:mt-6">
          <PortfolioRail photos={photos} />
        </div>
      </div>
    </section>
  );
}
