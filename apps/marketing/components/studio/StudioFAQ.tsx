'use client';

import { useState } from 'react';
import { ArrowUpRight, MessageCircle, Plus } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { STUDIO_WRAP } from './wrap';

interface FAQItem {
  question: string;
  answer: string;
}

/** FAQ: heading + highlighted WhatsApp card left (sticky on lg), accordion right; on phones the card follows the list. */
export function StudioFAQ({ faqs, service = 'studio' }: { faqs: FAQItem[]; service?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  const whatsappCard = (
    <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary-deep/25 via-card to-card p-6 lg:p-8">
      <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
      <span aria-hidden className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-deep to-primary text-primary-foreground">
        <MessageCircle className="h-5 w-5" />
      </span>
      <p className="relative mt-6 text-lg font-semibold text-foreground">Still have questions?</p>
      <a
        href={generateWhatsAppLink(service, 'Hi! I have a question...')}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-deep to-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-12px_hsl(var(--primary)/0.7)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Ask on WhatsApp
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );

  return (
    <section aria-labelledby="faq-heading" className="border-t border-border">
      <div className={`${STUDIO_WRAP} grid gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base text-foreground/70">Got questions? We&apos;ve got answers.</p>
            <div className="mt-8 hidden lg:block">{whatsappCard}</div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <ul className="divide-y divide-border border-y border-border">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={i}>
                  <h3>
                    <button
                      type="button"
                      id={`studio-faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`studio-faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className={`text-base font-semibold transition-colors duration-200 ${isOpen ? 'text-foreground underline decoration-accent-text decoration-2 underline-offset-4 [[data-theme=studio]_&]:text-primary [[data-theme=studio]_&]:no-underline' : 'text-foreground group-hover:underline group-hover:decoration-border group-hover:underline-offset-4 [[data-theme=studio]_&]:group-hover:text-primary [[data-theme=studio]_&]:group-hover:no-underline'}`}>
                        {f.question}
                      </span>
                      <span aria-hidden className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color] duration-300 ${isOpen ? 'rotate-45 border-primary bg-primary text-primary-foreground' : 'border-border text-foreground/70'}`}>
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  {/* grid-rows 0fr→1fr animates height without measuring. */}
                  <div
                    id={`studio-faq-a-${i}`}
                    role="region"
                    aria-labelledby={`studio-faq-q-${i}`}
                    className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-3xl pb-6 pr-12 text-sm leading-relaxed text-foreground/70 sm:text-base">{f.answer}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 lg:hidden">{whatsappCard}</div>
        </div>
      </div>
    </section>
  );
}
