'use client';

import { FadeIn } from '@/components/animations/FadeIn';
import { Check } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Browse & Select',
    description:
      'Explore our equipment catalog or studio spaces. Check specs, pricing, and availability.',
  },
  {
    number: '02',
    title: 'Check Availability',
    description:
      'View real-time availability for your preferred dates. No hidden surprises.',
  },
  {
    number: '03',
    title: 'Book via WhatsApp',
    description:
      "Tap 'Book Now' to open WhatsApp with pre-filled details. Confirm and you're set!",
  },
];

export function HowItWorks() {
  return (
    <section className='border-t border-primary/10 py-24'>
      {/* Section background tint */}
      <div className='absolute inset-x-0 h-[480px] bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(46,49,69,0.22),transparent)] pointer-events-none' />

      <div className='container relative mx-auto px-6'>
        <FadeIn>
          <div className='mb-16 text-center'>
            <p className='mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary opacity-80'>
              Simple Process
            </p>
            <h2 className='mb-4 text-4xl font-bold md:text-5xl'>
              How It Works
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-foreground/60'>
              From browsing to booking in under 3 clicks. No forms, no hassle.
            </p>
          </div>
        </FadeIn>

        <div className='grid gap-8 md:grid-cols-3'>
          {steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 0.15}>
              <div className='relative'>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className='absolute left-1/2 top-14 z-0 hidden h-px w-full bg-gradient-to-r from-primary/25 to-transparent md:block' />
                )}

                <div
                  className='
                  relative z-10 rounded-2xl p-8 text-center
                  border border-primary/12
                  bg-[rgba(17,17,22,0.75)] backdrop-blur-sm
                  transition-all duration-300
                  hover:border-primary/30
                  hover:shadow-[0_8px_32px_hsl(var(--primary)/0.12)]
                '
                >
                  {/* Step number circle */}
                  <div className='mb-6 flex justify-center'>
                    <div
                      className='
                      flex h-14 w-14 items-center justify-center rounded-full
                      border-2 border-primary/35
                      bg-primary/8
                      text-xl font-bold text-primary
                    '
                    >
                      {step.number}
                    </div>
                  </div>

                  <h3 className='mb-3 text-xl font-semibold text-white'>
                    {step.title}
                  </h3>
                  <p className='text-sm leading-relaxed text-foreground/60'>
                    {step.description}
                  </p>

                  {/* Final step checkmark */}
                  {index === steps.length - 1 && (
                    <div className='mt-6 flex justify-center'>
                      <div
                        className='
                        flex h-9 w-9 items-center justify-center rounded-full
                        border border-primary/25
                        bg-primary/10
                      '
                      >
                        <Check className='h-4 w-4 text-primary' />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5}>
          <div className='mt-12 text-center'>
            <p className='text-sm text-foreground/45'>
              Average booking time:{' '}
              <span className='font-semibold text-white'>5 minutes</span>
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
