'use client';

import { FadeIn } from '@/components/animations/FadeIn';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface ServiceFAQProps {
    faqs: FAQItem[];
    accentColor?: 'amber' | 'blue' | 'purple' | 'green';
}

const accentColors = {
    amber: 'text-amber-500 hover:text-amber-400',
    blue: 'text-blue-500 hover:text-blue-400',
    purple: 'text-purple-500 hover:text-purple-400',
    green: 'text-green-500 hover:text-green-400',
};

export function ServiceFAQ({ faqs, accentColor = 'amber' }: ServiceFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="border-t border-border py-24">
            <div className="container mx-auto px-6">
                <FadeIn>
                    <h2 className="mb-4 text-center text-4xl font-bold">Frequently Asked Questions</h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
                        Got questions? We've got answers.
                    </p>
                </FadeIn>

                <div className="mx-auto max-w-3xl">
                    {faqs.map((faq, index) => (
                        <FadeIn key={index} delay={index * 0.1}>
                            <div className="mb-4 overflow-hidden rounded-xl border border-border bg-muted/50">
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-secondary/50"
                                >
                                    <span className="pr-8 font-semibold text-foreground">{faq.question}</span>
                                    <ChevronDown
                                        className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${openIndex === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                <div
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

                <FadeIn delay={faqs.length * 0.1}>
                    <div className="mt-12 text-center">
                        <p className="mb-4 text-muted-foreground">Still have questions?</p>
                        <a
                            href="https://wa.me/919876543210?text=Hi!%20I%20have%20a%20question..."
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-block rounded-full bg-secondary px-8 py-3 font-semibold text-foreground transition-colors hover:bg-zinc-700`}
                        >
                            Ask on WhatsApp
                        </a>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
