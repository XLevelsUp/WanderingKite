import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** "Equipment We Use": heading left, one ruled row per kit group with its items as chips (rules draw in on scroll). */
export function GearList({ wrap, gear }: { wrap: string; gear: { icon: LucideIcon; title: string; body: string }[] }) {
  return (
    <section aria-labelledby="gear-heading">
      <div className={`${wrap} grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:py-24`}>
        <div data-reveal className="lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">The kit</p>
          <h2 id="gear-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Equipment We Use</h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">
            We shoot on Sony full-frame cameras and G Master prime lenses, with professional flash and continuous lighting — so your photos hold up on a phone screen and as a wall-sized print.
          </p>
        </div>

        <ul className="lg:col-span-8">
          {gear.map((g, i) => {
            const items = g.body.split(',').map((s) => s.trim()).filter(Boolean);
            return (
              <li key={g.title} className="group relative grid gap-4 py-8 last:pb-0 sm:grid-cols-[12rem_1fr] sm:gap-8">
                <span aria-hidden data-reveal="line" style={d(i * 200)} className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/60 via-primary/25 to-transparent" />
                <div data-reveal style={d(i * 200 + 150)} className="flex items-center gap-4 self-start">
                  <span className="pm-num h-11 w-11 text-xs">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <g.icon className="h-4 w-4 text-primary-deep transition-transform duration-500 group-hover:-rotate-12" aria-hidden />
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{g.title}</h3>
                  </div>
                </div>
                <ul className="flex flex-wrap content-start gap-2" aria-label={`${g.title} list`}>
                  {items.map((it, k) => (
                    <li
                      key={it}
                      data-reveal
                      style={d(i * 200 + 250 + k * 60)}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/85 transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-foreground"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
