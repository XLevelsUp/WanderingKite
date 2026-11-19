'use client';

import { useState, type CSSProperties } from 'react';
import { ArrowUpRight, MessageCircle, Plus } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';

/** FAQ (white tone): heading + sandstone WhatsApp card left (sticky on lg), numbered accordion right; phones: card after the list. */
export function PhotoFAQ({ faqs, wrap }: { faqs: { question: string; answer: string }[]; wrap: string }) {
  const [open, setOpen] = useState<number | null>(0);

  const card = (
    <div data-tone="sandstone" className="relative overflow-hidden rounded-2xl p-6 sm:p-8">
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/40" />
      <span aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/40" />
      <span aria-hidden className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-primary-foreground">
        <MessageCircle className="h-5 w-5" />
      </span>
      <p className="relative mt-6 text-xl font-semibold text-foreground">Still have questions?</p>
      <a
        href={generateWhatsAppLink('photography', 'Hi! I have a question...')}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Ask on WhatsApp
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  );

  return (
    <section aria-labelledby="faq-heading" >
      <div className={`${wrap} grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:py-24`}>
        <div className="lg:col-span-4">
          <div data-reveal className="lg:sticky lg:top-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">FAQ</p>
            <h2 id="faq-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-base text-foreground/80">Got questions? We&apos;ve got answers.</p>
            <div className="mt-8 hidden lg:block">{card}</div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <ul className="border-b border-border">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={i} data-reveal style={{ '--d': `${i * 90}ms` } as CSSProperties} className="relative">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-border" />
                  {/* Active rule: the open question gets a dark line that sweeps across. */}
                  <span aria-hidden className={`absolute left-0 top-0 h-px w-full origin-left bg-gradient-to-r from-[#CBB9A4] via-primary to-primary-deep transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${isOpen ? 'scale-x-100' : 'scale-x-0'}`} />
                  <h3>
                    <button
                      type="button"
                      id={`photo-faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`photo-faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-6"
                    >
                      <span className={`pm-num h-9 w-9 text-[11px] ${isOpen ? '' : 'is-off'}`}>{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-base font-semibold text-foreground transition-transform duration-300 group-hover:translate-x-1 sm:text-lg">{f.question}</span>
                      <span
                        aria-hidden
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color] duration-300 ${isOpen ? 'rotate-45 border-primary bg-primary text-primary-foreground' : 'border-border text-foreground group-hover:border-primary'}`}
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`photo-faq-a-${i}`}
                    role="region"
                    aria-labelledby={`photo-faq-q-${i}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-3xl pb-6 pl-[3.5rem] pr-14 text-base leading-relaxed text-foreground/75 sm:pl-[4rem]">{f.answer}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 lg:hidden">{card}</div>
        </div>
      </div>
    </section>
  );
}
