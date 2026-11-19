import { CheckCircle2 } from 'lucide-react';
import { STUDIO_WRAP } from './wrap';

interface Step {
  number: string;
  title: string;
  description: string;
}

/** Compact process: 4 columns joined by a rule on lg, 2×2 on tablet, a numbered list on phones. */
export function StudioProcess({ steps }: { steps: Step[] }) {
  return (
    <section aria-labelledby="process-heading" className="border-t border-border">
      <div className={`${STUDIO_WRAP} py-16 sm:py-20`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="process-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-base text-foreground/70">Simple, transparent process from inquiry to delivery</p>
          </div>
          <p className="inline-flex items-center gap-2 self-start text-sm font-semibold text-accent-text sm:self-auto">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            You&apos;re all set!
          </p>
        </div>

        {/* One column per step on desktop (4 on studio, 5 on photography). */}
        <ol className={`relative mt-8 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:gap-8 ${steps.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          {/* Connector behind the numbers on desktop. */}
          <span aria-hidden className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-primary-deep/60 via-primary/40 to-transparent lg:block" />
          {steps.map((s) => (
            <li key={s.number} className="relative flex gap-4 lg:flex-col">
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-deep/50 bg-background text-sm font-bold tabular-nums text-primary">
                {s.number.padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
