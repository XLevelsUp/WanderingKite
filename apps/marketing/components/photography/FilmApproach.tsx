import type { CSSProperties } from 'react';
import { VideoSlot } from './VideoSlot';
import { ApproachSteps } from './ApproachSteps';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
// Film width follows a capped height so the 9:16 frame never outgrows the viewport (never cropped).
const FILM_W = 'mx-auto w-full max-w-[17rem] sm:max-w-[19rem] lg:mx-0 lg:max-w-none lg:w-[min(100%,calc(min(70svh,36rem)*9/16))]';

/**
 * Showreel + Our Approach. lg: the film stays pinned (sticky) while the showreel intro and the three principles
 * scroll past it, each principle lighting up as it reaches the middle of the screen. Phones: film, then copy.
 */
export function FilmApproach({ wrap }: { wrap: string }) {
  return (
    <section aria-labelledby="showreel-heading" className="relative overflow-x-clip">
      <div className={`${wrap} grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:py-24`}>
        {/* ── Film (sticky on lg) ── */}
        <div className="lg:col-span-5">
          <figure className="lg:sticky lg:top-28">
            <div className={`relative ${FILM_W}`}>
              <div aria-hidden data-reveal="offset" style={d(250)} className="absolute -bottom-4 -right-4 left-4 top-4 rounded-2xl bg-[#CBB9A4]" />
              <div data-reveal className="relative rounded-2xl bg-[#FAF9F6] p-2 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)] sm:p-3">
                <VideoSlot src="/videos/showreel.webm" poster="/images/photography/showreel-poster.webp" className="aspect-[9/16] rounded-xl" label="Showreel" />
              </div>
            </div>
            <figcaption className={`mt-8 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/60 ${FILM_W}`}>
              <span>Showreel</span>
              <span className="text-accent-text">Films</span>
            </figcaption>
          </figure>
        </div>

        {/* ── Showreel intro + Our Approach ── */}
        <div className="lg:col-span-7 lg:pt-8">
          <div data-reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Films</p>
            <h2 id="showreel-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Showreel</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/80">
              Under a minute of our favourite frames — weddings, fashion, families and brands.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-16">
            <span aria-hidden data-reveal="line" className="absolute inset-x-0 top-0 h-px bg-foreground/20" />
            <h2 id="approach-heading" data-reveal style={d(150)} className="pt-12 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Approach
            </h2>
            <ApproachSteps />
          </div>
        </div>
      </div>
    </section>
  );
}
