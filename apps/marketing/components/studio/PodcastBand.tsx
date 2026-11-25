import { ArrowRight, Headphones, Mic, Radio, Zap } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { STUDIO_WRAP } from './wrap';

const GEAR = [
  { icon: Mic, title: 'Premium Microphones', description: 'Rode Procaster & Shure SM7B' },
  { icon: Headphones, title: 'Studio Monitors', description: 'Closed-back headphones for all guests' },
  { icon: Radio, title: 'Multi-Track Recording', description: 'Zoom H6 & audio interface' },
  { icon: Zap, title: 'Acoustic Treatment', description: 'Professional soundproofing & panels' },
];

// Static waveform heights (%) — decorative, so no animation cost.
const WAVE = [30, 55, 80, 45, 95, 60, 35, 70, 100, 50, 75, 40, 85, 55, 30, 65, 90, 45, 70, 35, 60, 80, 40, 55];

/** Studio-page band that promotes the Podcast Studio page (previously only linked from the footer). */
export function PodcastBand() {
  return (
    <section id="podcast" aria-labelledby="podcast-band-heading" className="scroll-mt-20 border-t border-border">
      <div className={`${STUDIO_WRAP} py-16 sm:py-20`}>
        <div className="relative overflow-hidden rounded-2xl border border-primary-deep/40 bg-gradient-to-br from-primary-deep/20 via-card to-card">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end gap-1 px-6 opacity-10 lg:h-20">
            {WAVE.map((h, i) => (
              <span key={i} className="flex-1 rounded-t-full bg-gradient-to-t from-primary-deep to-primary" style={{ height: `${h}%` }} />
            ))}
          </div>

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-16 lg:p-12">
            <div className="lg:col-span-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-deep/50 bg-primary-deep/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
                <Mic className="h-3.5 w-3.5" aria-hidden />
                Podcast Studio
              </p>
              <h2 id="podcast-band-heading" className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Podcast Recording <span className="text-accent-text">Studio</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Broadcast-quality podcast recording with professional acoustics, premium microphones, and expert support.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#studio-pricing"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-deep to-primary px-6 text-sm font-semibold text-primary-foreground transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View Podcast Packages
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={generateWhatsAppLink('podcast')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/70 px-6 backdrop-blur-sm text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Book Recording Session
                </a>
              </div>
            </div>

            {/* 2 columns from phone up; icon stacks above text on phones to keep the band short. */}
            <ul className="grid grid-cols-2 gap-2 sm:gap-4 lg:col-span-7">
              {GEAR.map((g) => (
                <li key={g.title} className="flex flex-col items-start gap-4 rounded-xl border border-border bg-background/60 p-4 backdrop-blur-sm sm:flex-row">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-deep/20 text-primary">
                    <g.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{g.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
