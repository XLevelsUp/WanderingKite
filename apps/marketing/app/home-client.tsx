'use client';

import { HowItWorks } from '@/components/sections/HowItWorks';
import { TechSpecs } from '@/components/sections/TechSpecs';
import { FAQ } from '@/components/sections/FAQ';
import { HeroSection } from '@/components/sections/HeroSection';
import { InstagramSection } from '@/components/sections/InstagramSection';
import { ValuesSection } from '@/components/sections/ValuesSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { PhotographyDiptych } from '@/components/sections/PhotographyDiptych';
import { StoriesInLight } from '@/components/photography/StoriesInLight';
import { ClientStories } from '@/components/sections/ClientStories';
import { LandingMotion } from '@/components/animations/LandingMotion';
import { homepageTestimonials } from '@/lib/service-page-data';

export function HomePageClient() {
  return (
    <main className="min-h-screen">
      {/* Shutter reveals, focus-pull headings and the exposure line — see LandingMotion. */}
      <LandingMotion />

      <HeroSection
        media={{ type: 'video', src: '/Video-67781.webm', alt: 'Wandering Kite Studio showreel', caption: 'Showreel · Coimbatore' }}
      />

      <InstagramSection />

      <ValuesSection />

      <ServicesSection />

      {/* Photography brand tagline, introducing the work below. */}
      <StoriesInLight />

      <PhotographyDiptych />

      {/* ── How It Works ────────────────────────────────── */}
      <HowItWorks />

      {/* ── Tech Specs ──────────────────────────────────── */}
      <TechSpecs />

      {/* ── Testimonials ────────────────────────────────── */}
      <ClientStories stories={homepageTestimonials} />

      {/* ── FAQ ─────────────────────────────────────────── */}
      <FAQ />

    </main>
  );
}
