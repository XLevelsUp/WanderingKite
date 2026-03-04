'use client';

import { Star, Quote } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';

interface Testimonial {
    name: string;
    role: string;
    content: string;
    rating: number;
    service?: string;
}

interface TestimonialsProps {
    testimonials: Testimonial[];
    accentColor?: 'amber' | 'blue' | 'purple' | 'green';
}

const accentColors = {
    amber: 'text-amber-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
};

export function Testimonials({ testimonials, accentColor = 'amber' }: TestimonialsProps) {
    return (
        <section className="border-t border-border bg-muted/30 py-24">
            <div className="container mx-auto px-6">
                <FadeIn>
                    <h2 className="mb-4 text-center text-4xl font-bold">What Our Clients Say</h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
                        Real feedback from creators who've worked with us
                    </p>
                </FadeIn>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <FadeIn key={index} delay={index * 0.1}>
                            <div className="relative h-full rounded-xl border border-border bg-muted/50 p-6">
                                <Quote className={`mb-4 h-8 w-8 ${accentColors[accentColor]} opacity-50`} />

                                {/* Rating */}
                                <div className="mb-4 flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < testimonial.rating
                                                    ? `fill-${accentColor}-500 ${accentColors[accentColor]}`
                                                    : 'text-zinc-700'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="mb-6 text-muted-foreground">{testimonial.content}</p>

                                {/* Author */}
                                <div className="border-t border-border pt-4">
                                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    {testimonial.service && (
                                        <p className={`mt-1 text-xs ${accentColors[accentColor]}`}>
                                            {testimonial.service}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
