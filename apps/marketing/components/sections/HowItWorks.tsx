'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Clock, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { ApertureIris } from '@/components/animations/ApertureIris';

// Copy unchanged from the previous versions of this section.
const STEPS = [
  { title: 'Browse & Select', description: 'Explore our equipment catalog or studio spaces. Check specs, pricing, and availability.' },
  { title: 'Check Availability', description: 'View real-time availability for your preferred dates. No hidden surprises.' },
  { title: 'Book via WhatsApp', description: "Tap 'Book Now' to open WhatsApp with pre-filled details. Confirm and you're set!" },
];

const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;

/** Simple numbered list: heading + WhatsApp left, three underlined steps right. */
export function HowItWorks() {
  const reduce = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SETTLE, delay },
  });

  return (
    <section aria-labelledby="how-heading" className="relative overflow-hidden bg-background">
      {/* Healthy spacing (8px grid): py 64/80/96, column gap 48 → 64, step rows 32 → 40 tall padding. */}
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:py-24 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        <motion.div {...reveal(0)} className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-text sm:text-xs">Simple Process</p>
          <h2 id="how-heading" className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-foreground">From browsing to booking in just 3 clicks. Hassle free!</p>

          <a
            data-magnetic
                href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[transform,background-color,box-shadow] duration-200 hover:bg-primary/90 hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.7)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Book via WhatsApp
          </a>
          <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
            <Clock className="h-4 w-4 text-accent-text" aria-hidden />
            Average booking time: <span className="font-semibold text-accent-text">5 minutes</span>
          </p>

          {/* Desktop: a camera iris fills the open space under the CTA and opens as you scroll the steps. */}
          <ApertureIris className="mt-12 hidden w-full max-w-[16rem] lg:block" />
        </motion.div>

        {/* Porcelain wash behind the steps (pseudo-element; isolate keeps it above the particle canvas) so particles never compete with text. */}
        <ol className="relative isolate before:absolute before:-inset-x-6 before:inset-y-0 before:-z-10 before:rounded-2xl before:bg-background/85 before:backdrop-blur-[2px] before:content-[''] lg:col-span-7">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              {...reveal(0.08 * (i + 1))}
              className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-border py-8 first:border-t sm:grid-cols-[4rem_1fr] lg:py-10"
            >
              <span className="text-2xl font-bold tabular-nums leading-none tracking-[-0.03em] text-accent-bright sm:text-3xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.015em] text-foreground">{s.title}</h3>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-foreground/80">{s.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
