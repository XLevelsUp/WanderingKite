'use client';

import { ServiceCard } from '@/components/services/ServiceCard';
import { TrustSection } from '@/components/shared/TrustSection';
import { Footer } from '@/components/shared/Footer';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { TechSpecs } from '@/components/sections/TechSpecs';
import { FAQ } from '@/components/sections/FAQ';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer } from '@/components/animations/StaggerContainer';
import { Camera, Video, Building2, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Photography',
    tagline: 'Event & Lifestyle',
    description:
      'Event and lifestyle photography that captures authentic moments with cinematic precision.',
    icon: Camera,
    href: '/photography',
    badge: 'Popular',
    features: ['Weddings & Events', 'Commercial Shoots', 'Portrait Sessions'],
    delay: 0,
  },
  {
    title: 'Equipment Rentals',
    tagline: 'Pro-Grade Gear',
    description:
      'Professional cameras, lenses, and lighting gear for your creative projects — by the day or week.',
    icon: Video,
    href: '/rentals',
    features: [
      'Sony & Canon Bodies',
      'Prime & Zoom Lenses',
      'Full Lighting Kit',
    ],
    delay: 0.1,
  },
  {
    title: 'Studio Space',
    tagline: '1200 sq ft',
    description:
      'Premium studio facilities for photography and video production with cyclorama wall.',
    icon: Building2,
    href: '/studio',
    badge: 'New',
    features: ['Cyclorama Wall', 'ProFoto Lighting', 'Green Screen'],
    delay: 0.2,
  },
  {
    title: 'Podcast Studio',
    tagline: 'Acoustically Treated',
    description:
      'Fully-equipped podcast recording space with professional acoustics and multitrack recording.',
    icon: Mic,
    href: '/podcast',
    features: [
      'Acoustic Treatment',
      'Rode Podmic Setup',
      'Multitrack Recording',
    ],
    delay: 0.3,
  },
];

export default function HomePage() {
  return (
    <main className='min-h-screen'>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20'>
        {/* Layered radial + vignette */}
        <div className='absolute inset-0 bg-gradient-to-b from-[rgba(46,49,69,0.30)] via-transparent to-[rgba(10,10,11,0.85)]' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgba(46,49,69,0.40),transparent)]' />

        {/* Decorative ring — uses primary brand color */}
        <div className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
          <div className='h-[520px] w-[520px] rounded-full border border-primary/10' />
          <div className='absolute inset-8 rounded-full border border-primary/7' />
        </div>

        <div className='relative z-10 text-center'>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary opacity-80'
          >
            Creative Infrastructure
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='mb-6 text-5xl font-bold leading-tight sm:text-6xl md:text-7xl lg:text-8xl'
          >
            Where Vision <br />
            <span className='text-gradient-hero'>Meets Craft</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='mx-auto mb-8 max-w-2xl text-lg text-foreground/60 md:text-xl'
          >
            Photography · Equipment Rentals · Studio Spaces · Podcast Production
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className='flex items-center justify-center gap-4'
          >
            <span className='flex items-center gap-2 text-sm text-foreground/50'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
              </span>
              Available Now
            </span>
            <span className='text-primary/25'>•</span>
            <span className='text-sm text-foreground/50'>
              Coimbatore, India
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Services Grid ───────────────────────────────── */}
      <section className='container mx-auto px-6 py-24'>
        <FadeIn>
          <div className='mb-4 text-center'>
            <p className='mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary opacity-80'>
              What We Offer
            </p>
            <h2 className='text-4xl font-bold text-white'>Our Services</h2>
          </div>
        </FadeIn>

        <StaggerContainer className='mt-12 grid gap-6 md:grid-cols-2 lg:gap-8'>
          {services.map((svc) => (
            <motion.div
              key={svc.href}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className='h-full'
            >
              <ServiceCard
                title={svc.title}
                tagline={svc.tagline}
                description={svc.description}
                icon={svc.icon}
                href={svc.href}
                badge={svc.badge}
                features={svc.features}
                delay={svc.delay}
              />
            </motion.div>
          ))}
        </StaggerContainer>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <HowItWorks />

      {/* ── Tech Specs ──────────────────────────────────── */}
      <TechSpecs />

      {/* ── Trust Section ───────────────────────────────── */}
      <FadeIn>
        <TrustSection />
      </FadeIn>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <FAQ />

      {/* ── Footer ──────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
