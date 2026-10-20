'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Instagram, Linkedin } from 'lucide-react';
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
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
              {/* Full opacity, no blend mode: opacity-50 + mix-blend-overlay
                  washed the portrait into the gradient behind it. */}
              <div className="absolute inset-0 bg-[url('/founder.webp')] bg-cover bg-center transition-transform duration-700 hover:scale-105" />

              {/* Vignette only at the foot of the card, so the caption stays
                  readable without dimming the face. */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950/80 to-transparent" />

              {/* The blur sits behind the caption alone, not over the photo. */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="inline-block rounded-2xl bg-zinc-950/40 backdrop-blur-md px-4 py-3">
                  <p className="text-amber-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1">
                    Founder &amp; Creative Director
                  </p>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                    Sandesh Anantha Kumar
                  </h1>
                </div>
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
              {/* The quote leads: it explains the studio's name, which the rest
                  of the copy builds on. */}
              <blockquote className="border-l-2 border-amber-500/60 pl-6 mb-10">
                <p className="text-2xl lg:text-3xl font-medium text-white leading-snug mb-4">
                  &ldquo;I named it Wandering Kite because a kite flies best
                  with no strings attached. I wanted the freedom to work with
                  everyone and tell every kind of story.&rdquo;
                </p>
                <footer className="text-sm text-amber-500 font-semibold tracking-wide">
                  — Sandesh Anantha Kumar, Founder &amp; Creative Director
                </footer>
              </blockquote>

              <p className="text-zinc-400 leading-relaxed mb-6">
                Four years ago, Sandesh Anantha Kumar began working as an
                independent photographer with a simple belief: every story
                deserves to be told honestly, whether it belongs to a couple, a
                family, or a brand. Working on their own, that belief took shape
                across more than 350 weddings and over 150 corporate events,
                each one teaching the value of preparation, patience, and being
                present for moments that cannot be repeated.
              </p>

              <p className="text-zinc-400 leading-relaxed mb-6">
                The name Wandering Kite carries the same philosophy. A kite
                rises with the wind and the freedom to move with it. No strings
                attached means no limits on who we work with or what we create.
                From wedding ceremonies to corporate events, from portraits to
                product and brand shoots, the approach stays the same: listen
                first, then create.
              </p>

              <p className="text-zinc-400 leading-relaxed mb-6">
                Since launching as Wandering Kite, the studio has delivered more
                than 100 projects and grown into a full-service creative studio
                in RS Puram, Coimbatore. Today the work spans wedding and event
                photography, commercial and corporate shoots, studio and
                equipment rentals, and a podcast recording space, all built
                around the idea that great creative work should be open to
                everyone with a story to tell.
              </p>

              <p className="text-zinc-400 leading-relaxed mb-6">
                Whether it is a wedding where emotion matters most or a
                corporate event where timing matters most, the goal is the same:
                photographs that feel true to the people in them. Clients across
                Coimbatore, Tiruppur, Salem, and Erode, along with destination
                weddings across India, have trusted the studio with moments that
                matter.
              </p>

              <p className="text-zinc-400 leading-relaxed mb-6">
                What has never changed is how every project begins: with a
                conversation. Understanding the people, the purpose, and the
                feeling behind a shoot is what turns a good photograph into one
                that lasts.
              </p>

              <p className="text-zinc-400 leading-relaxed mb-12">
                Today, Sandesh Anantha Kumar leads Wandering Kite with the same
                open spirit that inspired the name.
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
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
