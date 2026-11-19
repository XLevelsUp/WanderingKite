import type { CSSProperties } from 'react';
import { CheckCircle2 } from 'lucide-react';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/**
 * How It Works. lg: one column per step on a rail that draws left → right, each number landing as the line reaches it.
 * Below lg: a vertical timeline whose rail draws top → bottom.
 */
export function PhotoProcess({ steps, wrap }: { steps: { number: string; title: string; description: string }[]; wrap: string }) {
  return (
    <section aria-labelledby="process-heading">
      <div className={`${wrap} py-16 sm:py-20 lg:py-24`}>
        <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">Process</p>
            <h2 id="process-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-base text-foreground/80">Simple, transparent process from inquiry to delivery</p>
          </div>
          <p className="inline-flex items-center gap-2 self-start text-sm font-semibold text-foreground sm:self-auto">
            <CheckCircle2 className="h-4 w-4 text-accent-text" aria-hidden />
            You&apos;re all set!
          </p>
        </div>

        <ol className={`relative mt-12 grid gap-10 lg:mt-16 lg:gap-8 ${steps.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          {/* Rails: vertical below lg, horizontal on lg. */}
          <span aria-hidden className="absolute bottom-7 left-7 top-7 w-0.5 rounded-full bg-primary/15 lg:hidden">
            <span data-reveal="vline" className="absolute inset-0 rounded-full bg-gradient-to-b from-[#CBB9A4] via-primary to-primary-deep" />
          </span>
          <span aria-hidden className="absolute left-7 right-0 top-7 hidden h-0.5 rounded-full bg-primary/15 lg:block">
            <span data-reveal="line" className="absolute inset-0 rounded-full bg-gradient-to-r from-[#CBB9A4] via-primary to-primary-deep" />
          </span>

          {steps.map((s, i) => (
            <li key={s.number} className="group relative grid grid-cols-[3.5rem_1fr] gap-x-6 lg:block">
              <span data-reveal style={d(i * 300)} className="relative z-10 block h-14 w-14">
                <span className={`pm-num h-14 w-14 text-base ${i === steps.length - 1 ? 'is-live' : ''}`}>{s.number.padStart(2, '0')}</span>
              </span>
              <div data-reveal style={d(i * 300 + 120)} className="pt-3 lg:pt-6">
                <h3 className="text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary-deep">{s.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-foreground/75">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
