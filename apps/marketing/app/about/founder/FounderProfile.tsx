'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Instagram, Linkedin, MapPin, Calendar, Camera } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Footer } from '@/components/shared/Footer';

/** Standard container wrap with strict responsive padding */
const WRAP = 'mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8';

/** Exact stats matching the home page proof band (ValuesSection.tsx) */
const STATS = [
  { value: '100+', label: 'Weddings' },
  { value: '50+', label: 'Corporate Events' },
  { value: '100+', label: 'Projects as Wandering Kite' },
];

export function FounderProfile() {
  return (
    <>
      <main className="min-h-screen pt-24 sm:pt-28 pb-16">
        <div className={WRAP}>
          {/* ── Breadcrumb Navigation ── */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-foreground/60 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to Home
            </Link>
          </div>

          {/* ── Executive Profile Header (Strict 8px spacing, clean avatar) ── */}
          <section aria-label="Founder Profile" className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Photo + Identity */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Circular photo size as requested from landing page */}
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted ring-2 ring-border/50">
                  <Image
                    src="/founder.webp"
                    alt="Sandesh Anantha Kumar, Founder & Creative Director"
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    priority
                    className="object-cover object-top"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-text">
                    Founder &amp; Creative Director
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Sandesh Anantha Kumar
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/70 sm:text-sm">
                    <MapPin className="h-3.5 w-3.5 text-accent-text shrink-0" aria-hidden />
                    Wandering Kite Studio · RS Puram, Coimbatore
                  </p>
                </div>
              </div>

              {/* Direct Quick Actions */}
              <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t border-border/60 sm:border-t-0">
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-[filter,transform] duration-200 hover:brightness-95 active:scale-[0.98]"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  Email Directly
                </a>
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:border-foreground"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  Call
                </a>
              </div>
            </div>

            {/* Signature Quote Banner */}
            <div className="mt-8 rounded-xl border border-border/70 bg-background/60 p-5 sm:p-6">
              <blockquote className="relative">
                <p className="text-base sm:text-lg font-medium leading-relaxed text-foreground italic">
                  &ldquo;I named it Wandering Kite because a kite flies best
                  with no strings attached. I wanted the freedom to work with
                  everyone and tell every kind of story.&rdquo;
                </p>
                <footer className="mt-3 text-xs font-semibold tracking-wide text-accent-text not-italic">
                  — Sandesh Anantha Kumar, Founder &amp; Creative Director
                </footer>
              </blockquote>
            </div>

            {/* Studio Credentials Strip */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-foreground/70 border-t border-border/60 pt-6">
              <span className="inline-flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-accent-text" aria-hidden />
                Wedding, Event &amp; Commercial Photography
              </span>
              <span aria-hidden className="hidden sm:inline h-3 w-px bg-border" />
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-accent-text" aria-hidden />
                Active Since 2022
              </span>
            </div>
          </section>

          {/* ── Exact Home Page Proof Stats (Strict 8px Spacing) ── */}
          <section aria-label="Key Milestones" className="mt-6">
            <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border rounded-2xl border border-border bg-card overflow-hidden">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="p-6 text-center sm:text-left transition-colors hover:bg-muted/30"
                >
                  <dd className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-mono">
                    {s.value}
                  </dd>
                  <dt className="mt-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </section>

          {/* ── Editorial Narrative (Strict Content Preservation) ── */}
          <article aria-labelledby="story-heading" className="mt-10 sm:mt-14 rounded-2xl border border-border bg-card p-6 sm:p-10 lg:p-12">
            <header className="mb-8 border-b border-border/70 pb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-text">
                The Journey
              </p>
              <h2 id="story-heading" className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Behind Wandering Kite
              </h2>
            </header>

            <div className="space-y-6 text-base leading-relaxed text-foreground/80 sm:text-lg sm:leading-relaxed">
              <p>
                Four years ago, Sandesh Anantha Kumar began working as an
                independent photographer with a simple belief: every story
                deserves to be told honestly, whether it belongs to a couple, a
                family, or a brand. Working on their own, that belief took shape
                across more than 100 weddings and over 50 corporate events,
                each one teaching the value of preparation, patience, and being
                present for moments that cannot be repeated.
              </p>

              <p>
                The name Wandering Kite carries the same philosophy. A kite
                rises with the wind and the freedom to move with it. No strings
                attached means no limits on who we work with or what we create.
                From wedding ceremonies to corporate events, from portraits to
                product and brand shoots, the approach stays the same: listen
                first, then create.
              </p>

              <p>
                Since launching as Wandering Kite, the studio has delivered more
                than 100 projects and grown into a full-service creative studio
                in RS Puram, Coimbatore. Today the work spans wedding and event
                photography, commercial and corporate shoots, studio and
                equipment rentals, and a podcast recording space, all built
                around the idea that great creative work should be open to
                everyone with a story to tell.
              </p>

              <p>
                Whether it is a wedding where emotion matters most or a
                corporate event where timing matters most, the goal is the same:
                photographs that feel true to the people in them. Clients across
                Coimbatore, Tiruppur, Salem, and Erode, along with destination
                weddings across India, have trusted the studio with moments that
                matter.
              </p>

              <p>
                What has never changed is how every project begins: with a
                conversation. Understanding the people, the purpose, and the
                feeling behind a shoot is what turns a good photograph into one
                that lasts.
              </p>

              <p>
                Today, Sandesh Anantha Kumar leads Wandering Kite with the same
                open spirit that inspired the name.
              </p>
            </div>

            {/* Social profiles & direct connect */}
            <div className="mt-10 border-t border-border/70 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Connect with Sandesh</p>
                <p className="text-xs text-foreground/60">Follow updates on social or reach out directly.</p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={siteConfig.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-colors hover:border-accent-text/40 hover:text-accent-text"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-colors hover:border-accent-text/40 hover:text-accent-text"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:border-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}
