'use client';

import { ServiceCard } from '@/components/services/ServiceCard';
import { TrustSection } from '@/components/shared/TrustSection';
import { Footer } from '@/components/shared/Footer';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { TechSpecs } from '@/components/sections/TechSpecs';
import { PortfolioWall } from '@/components/sections/PortfolioWall';
import { FAQ } from '@/components/sections/FAQ';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer } from '@/components/animations/StaggerContainer';
import { Camera, Video, Building2, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20'>
        <div className='absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950' />
        <div className='relative z-10 text-center'>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-7xl lg:text-8xl'
          >
            Creative Infrastructure
            <br />
            <span className='bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500 bg-clip-text text-transparent'>
              for Modern Creators
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='mx-auto mb-8 max-w-2xl text-lg text-zinc-400 md:text-xl'
          >
            Photography • Equipment Rentals • Studio Spaces • Podcast Production
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className='flex items-center justify-center gap-4'
          >
            <span className='flex items-center gap-2 text-sm text-zinc-500'>
              <span className='h-2 w-2 rounded-full bg-green-500 animate-pulse'></span>
              Available Now
            </span>
            <span className='text-zinc-700'>•</span>
            <span className='text-sm text-zinc-500'>Based in India</span>
          </motion.div>
        </div>
      </section>

      {/* Service Verticals Grid */}
      <section className='container mx-auto px-6 py-24'>
        <FadeIn>
          <h2 className='mb-12 text-center text-4xl font-bold'>Our Services</h2>
        </FadeIn>
        <StaggerContainer className='grid gap-6 md:grid-cols-2 lg:gap-8'>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ServiceCard
              title='Photography'
              description='Event and lifestyle photography that captures authentic moments'
              icon={<Camera />}
              href='/photography'
              accentColor='amber'
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ServiceCard
              title='Equipment Rentals'
              description='Professional cameras, lenses, and gear for your creative projects'
              icon={<Video />}
              href='/rentals'
              accentColor='blue'
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ServiceCard
              title='Studio Space'
              description='Premium studio facilities for photography and video production'
              icon={<Building2 />}
              href='/studio'
              accentColor='purple'
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ServiceCard
              title='Podcast Studio'
              description='Fully-equipped podcast recording space with professional acoustics'
              icon={<Mic />}
              href='/podcast'
              accentColor='green'
            />
          </motion.div>
        </StaggerContainer>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Tech Specs */}
      <TechSpecs />

      {/* Trust Section */}
      <FadeIn>
        <TrustSection />
      </FadeIn>

      {/* Portfolio Wall */}
      {/* <PortfolioWall /> */}

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </main>
  );
}
