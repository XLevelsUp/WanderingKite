'use client';

import { FadeIn } from '@/components/animations/FadeIn';
import { CheckCircle2 } from 'lucide-react';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  steps: ProcessStep[];
  accentColor?: 'amber' | 'blue' | 'purple' | 'green';
}

const accentColors = {
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'border-purple-500/20',
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'border-green-500/20',
  },
};

export function ProcessTimeline({
  steps,
  accentColor = 'amber',
}: ProcessTimelineProps) {
  const colors = accentColors[accentColor];

  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-6">
        <FadeIn>
          <h2 className="mb-4 text-center text-4xl font-bold">How It Works</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Simple, transparent process from inquiry to delivery
          </p>
        </FadeIn>

        <div className="mx-auto max-w-4xl">
          {steps.map((step, index) => (
            <FadeIn key={index} delay={index * 0.15}>
              <div className="relative mb-8 flex gap-6 last:mb-0">
                {/* Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 h-full w-0.5 bg-secondary" />
                )}

                {/* Step Number */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 ${colors.border} ${colors.bg} ${colors.text} font-bold`}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="rounded-xl border border-border bg-muted/50 p-6">
                    <h3 className="mb-2 text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}

          {/* Completion Badge */}
          <FadeIn delay={steps.length * 0.15}>
            <div className="flex justify-center pt-4">
              <div
                className={`flex items-center gap-2 rounded-full ${colors.bg} px-6 py-3`}
              >
                <CheckCircle2 className={`h-5 w-5 ${colors.text}`} />
                <span className={`font-semibold ${colors.text}`}>
                  You're all set!
                </span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
