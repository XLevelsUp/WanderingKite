'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Plus } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';

// Copy unchanged from the previous version of this section.
const FAQS = [
  {
    question: 'Do you provide technicians or operators with the equipment?',
    answer:
      'We offer optional technical support for an additional fee. Our experienced technicians can assist with setup, operation, and troubleshooting. For studio and podcast bookings, basic technical guidance is included.',
  },
  {
    question: 'Is parking available at your studio location?',
    answer:
      'Yes! Parking space for 1 car and 2 bikes is available at our studio location. The studio is situated in a secure area, and additional parking options may also be available nearby when needed.',
  },
  {
    question: 'Do you have power backup for studio sessions?',
    answer:
      'Absolutely. Our studio provides UPS power backup for shoots and sensitive equipment to help ensure smooth and uninterrupted operations during your session.',
  },
  {
    question: 'Can I extend my rental period if needed?',
    answer:
      'Yes, extensions are subject to availability. Contact us via WhatsApp at least 2 hours before your rental ends. Extension rates are prorated based on our standard hourly/daily rates.',
  },
];

const SETTLE = { type: 'spring', bounce: 0, duration: 0.9 } as const;

export function FAQ() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const reveal = (delay = 0) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SETTLE, delay },
  });

  return (
    <section aria-labelledby="faq-heading" className="bg-background">
      {/* Strict spacing (8px grid): top 24/32 (joins client stories at one block gap), bottom 64/80/96, column gap 48 → 64. */}
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 pt-6 sm:px-8 sm:pb-20 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:pb-24 lg:pt-8 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        {/* Header + WhatsApp help — sticky beside the list on desktop. */}
        <motion.div {...reveal(0)} className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <h2 id="faq-heading" className="text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-foreground">
            Everything you need to know before booking. Still have questions? <span className="font-semibold text-accent-text">WhatsApp us!</span>
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <p className="text-base font-semibold text-foreground">Didn&apos;t find your answer?</p>
            <a
              data-magnetic
                href={generateWhatsAppLink(undefined, 'Hi! I have a question...')}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[transform,background-color,box-shadow] duration-200 hover:bg-primary/90 hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.7)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Ask on WhatsApp
            </a>
          </div>
        </motion.div>

        {/* Accordion — one open at a time; grid-rows 0fr→1fr animates height without measuring. */}
        <div className="lg:col-span-7">
          {FAQS.map((f, i) => {
            const on = open === i;
            return (
              <motion.div key={f.question} {...reveal(0.05 * (i + 1))} className="relative border-t border-border last:border-b">
                {/* Open item: an orange rule sweeps along its top edge. */}
                <span aria-hidden className={`absolute -top-px left-0 h-px w-full origin-left bg-accent-text transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${on ? 'scale-x-100' : 'scale-x-0'}`} />
                <h3>
                  <button
                    type="button"
                    id={`faq-button-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-content-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="group flex w-full items-center gap-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className={`text-[11px] font-semibold tracking-[0.24em] tabular-nums transition-colors duration-300 ${on ? 'text-accent-text' : 'text-foreground/50'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`flex-1 text-base font-semibold transition-colors duration-300 sm:text-lg ${on ? 'text-accent-text' : 'text-foreground group-hover:text-accent-text'}`}>{f.question}</span>
                    <span
                      aria-hidden
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300 ${
                        on ? 'rotate-45 border-primary bg-primary text-primary-foreground' : 'border-border text-foreground group-hover:border-primary'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-content-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-xl pb-6 pl-[calc(1.5rem+2ch)] pr-14 text-base leading-relaxed text-foreground/80">{f.answer}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
