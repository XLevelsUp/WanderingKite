'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function FounderProfile() {
  return (
    <main className="min-h-screen bg-zinc-950 pt-20">
      {/* Header */}
      <header className="sticky top-20 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          {/* Left Column: Photo & Parallax Entry */}
          <div className="lg:col-span-5 relative lg:sticky lg:top-40">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-900 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)]"
            >
              {/* Photo Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
              <div className="absolute inset-0 bg-[url('/images/team/founder.jpg')] bg-cover bg-center opacity-50 mix-blend-overlay transition-transform duration-700 hover:scale-105" />

              {/* Glow/Vignette Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-50" />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-2">
                  Founder & Creative Director
                </p>
                <h1 className="text-4xl font-bold text-white">Founder Name</h1>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-invert prose-lg max-w-none"
            >
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 leading-tight">
                Crafting visual narratives that{' '}
                <span className="text-amber-500">resonate and endure.</span>
              </h2>

              <p className="text-zinc-400 leading-relaxed mb-6">
                With over a decade of experience in visual storytelling, our
                founder established Wandering Kite with a singular vision: to
                build a creative infrastructure where state-of-the-art
                technology meets boundless artistic expression.
              </p>

              <p className="text-zinc-400 leading-relaxed mb-12">
                Specializing in high-end cinematography and event photography,
                the journey began as a passionate pursuit of freezing time and
                has evolved into one of Coimbatore's premier full-service
                creative studios. Driven by an unwavering commitment to quality,
                every project is approached with cinematic precision and a deep
                understanding of narrative dynamics.
              </p>

              <hr className="border-white/10 my-12" />

              {/* Contact & Socials */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Connect</h3>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 text-zinc-950 px-8 py-4 rounded-full font-bold hover:bg-amber-400 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Email Directly
                  </a>
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 bg-zinc-900 border border-white/10 text-white px-8 py-4 rounded-full font-medium hover:border-amber-500/50 hover:bg-zinc-800 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    {siteConfig.contact.phone}
                  </a>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href={siteConfig.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href={siteConfig.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={siteConfig.links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
