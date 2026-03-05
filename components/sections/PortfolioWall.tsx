'use client';

import { FadeIn } from "@/components/animations/FadeIn";
import { Camera, Play } from "lucide-react";

const portfolioItems = [
    {
        id: 1,
        type: "Wedding",
        title: "Destination Wedding - Jaipur",
        category: "Photography",
        span: "col-span-2 row-span-2",
    },
    {
        id: 2,
        type: "Podcast",
        title: "Tech Talks Series",
        category: "Podcast Studio",
        span: "col-span-1 row-span-1",
    },
    {
        id: 3,
        type: "Fashion",
        title: "Studio Fashion Shoot",
        category: "Studio Rental",
        span: "col-span-1 row-span-1",
    },
    {
        id: 4,
        type: "Corporate",
        title: "Product Launch Event",
        category: "Photography",
        span: "col-span-1 row-span-2",
    },
    {
        id: 5,
        type: "Music",
        title: "Music Video Production",
        category: "Equipment Rental",
        span: "col-span-2 row-span-1",
    },
];

export function PortfolioWall() {
    return (
        <section className="border-t border-border bg-muted/30 py-24">
            <div className="container mx-auto px-6">
                <FadeIn>
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                            Trusted by Creators Across India
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            From intimate weddings to large-scale productions, we've powered thousands of creative projects.
                        </p>
                    </div>
                </FadeIn>

                {/* Masonry Grid */}
                <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {portfolioItems.map((item, index) => (
                        <FadeIn key={item.id} delay={index * 0.1}>
                            <div
                                className={`group relative overflow-hidden rounded-xl border border-border bg-card ${item.span}`}
                            >
                                {/* Placeholder Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />

                                {/* Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {item.type === "Podcast" ? (
                                        <Play className="h-16 w-16 text-zinc-700" />
                                    ) : (
                                        <Camera className="h-16 w-16 text-zinc-700" />
                                    )}
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                                            {item.category}
                                        </span>
                                        <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={0.6}>
                    <div className="mt-12 text-center">
                        <p className="mb-4 text-muted-foreground">Join 500+ satisfied clients</p>
                        <div className="flex items-center justify-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="h-10 w-10 rounded-full border-2 border-zinc-950 bg-secondary"
                                    />
                                ))}
                            </div>
                            <span className="ml-2 text-sm text-muted-foreground">and many more...</span>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
