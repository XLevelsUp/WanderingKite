'use client';

import { FadeIn } from '@/components/animations/FadeIn';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Do you provide technicians or operators with the equipment?',
    answer:
      'We offer optional technical support for an additional fee. Our experienced technicians can assist with setup, operation, and troubleshooting. For studio and podcast bookings, basic technical guidance is included.',
  },
  // {
  //   question: "What's the security deposit for equipment rentals?",
  //   answer:
  //     'Security deposits vary by equipment value: ₹5,000-₹10,000 for cameras/lenses, ₹2,000-₹5,000 for lighting/audio. Deposits are fully refundable upon safe return of equipment. We accept cash, UPI, or bank transfer.',
  // },
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
  // {
  //   question: 'What happens if equipment gets damaged during my rental?',
  //   answer:
  //     'Minor wear and tear is expected and covered. For accidental damage, repair costs are deducted from your security deposit. We recommend purchasing our optional damage waiver (10% of rental cost) for complete peace of mind.',
  // },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-6">
        <FadeIn>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Everything you need to know before booking. Still have questions?
              WhatsApp us!
            </p>
          </div>
        </FadeIn>

        <div className="mx-auto max-w-3xl">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="mb-4 overflow-hidden rounded-xl border border-border bg-muted/50">
                <button
                  id={`faq-button-${index}`}
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-content-${index}`}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-secondary/50"
                >
                  <span className="pr-8 font-semibold text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${openIndex === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <div
                  id={`faq-content-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                    }`}
                >
                  <div className="border-t border-border p-6 pt-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.6}>
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">
              Didn't find your answer?
            </p>
            <a
              href="https://wa.me/917010092090?text=Hi!%20I%20have%20a%20question..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-green-600 px-8 py-3 font-semibold text-foreground transition-colors hover:bg-green-500"
            >
              Ask on WhatsApp
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
