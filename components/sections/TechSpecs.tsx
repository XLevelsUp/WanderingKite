"use client";

import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { motion } from "framer-motion";
import { Camera, Video, Mic, Zap } from "lucide-react";

const gear = [
  {
    name: "Sony G-Master Lenses",
    category: "Optics",
    badge: "Industry Standard",
    icon: Camera,
    specs: ["f/1.4-2.8", "Full-Frame", "OSS"],
  },
  {
    name: "Rode NTG & Procaster",
    category: "Audio",
    badge: "Broadcast Quality",
    icon: Mic,
    specs: ["XLR", "Low Noise", "Phantom Power"],
  },
  {
    name: "Aputure LED Panels",
    category: "Lighting",
    badge: "CRI 96+",
    icon: Zap,
    specs: ["Bi-Color", "DMX Control", "Wireless"],
  },
];

export function TechSpecs() {
  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-6">
        <FadeIn>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Professional-Grade Equipment
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              The same gear used by top production houses and content creators
              worldwide.
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gear.map((item) => (
            <motion.div
              key={item.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-muted/50 p-6 transition-all hover:border-border"
            >
              {/* Badge */}
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  {item.badge}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <item.icon className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-bold">{item.name}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {item.category}
              </p>

              {/* Specs */}
              <ul className="space-y-1">
                {item.specs.map((spec) => (
                  <li
                    key={spec}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className="h-1 w-1 rounded-full bg-zinc-600" />
                    {spec}
                  </li>
                ))}
              </ul>

              {/* Hover Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              All equipment is insured, regularly serviced, and sanitized
              between rentals
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
