'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Mail,
  Phone,
  Instagram,
  Youtube,
  Linkedin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { InstagramFeed } from './InstagramFeed';

const services = [
  { name: 'Photography', href: '/photography' },
  //{ name: "Equipment Rentals", href: "/rentals" },
  { name: 'Studio Space', href: '/studiospace' },
  { name: 'Podcast Studio', href: '/podcast' },
];

const legal = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Rental Terms', href: '/terms' },
];

interface FooterProps {
  account?: 'wanderingkite' | 'studio';
}

import { usePathname } from 'next/navigation';

export function Footer({ account = 'wanderingkite' }: FooterProps) {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-background">
      {/* Instagram Follow CTA */}
      <div className="border-b border-border bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 flex justify-center">
              <Instagram className="h-12 w-12 text-pink-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">
              Get 10% Off Your First Rental
            </h2>
            <p className="mb-6 text-muted-foreground">
              Follow us on Instagram for exclusive deals, behind-the-scenes
              content, and creative inspiration
            </p>
          </div>

          {/* Premium Instagram Reels / Video Feed */}
          <div className="my-10 mx-auto max-w-6xl">
            <InstagramFeed account={account} />
          </div>

          <div className="mx-auto max-w-2xl text-center">
            <a
              href={account === 'studio' ? 'https://instagram.com/studiospacecbe' : 'https://instagram.com/wanderingkitestudio'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-semibold text-foreground transition-all hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-pink-500/50"
            >
              <Instagram className="h-5 w-5" />
              Follow @{account === 'studio' ? 'studiospacecbe' : 'wanderingkitestudio'}
            </a>
            <p className="mt-4 text-xs text-muted-foreground">
              DM us "FIRST10" after following to claim your discount
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Socials */}
          <div>
            <Link href="/" className="mb-4 inline-block group">
              <Image
                src="/wkfulllogo.png"
                alt={siteConfig.name}
                width={320}
                height={80}
                className="h-20 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="mb-6 text-sm text-muted-foreground">
              Creative infrastructure for modern creators. Empowering your
              vision with professional gear and spaces.
            </p>
            <div className="flex gap-4">
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Service Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground inline-block py-1"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Local SEO/Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Visit Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  {siteConfig.contact.address.street}
                  <br />
                  {siteConfig.contact.address.city},{' '}
                  {siteConfig.contact.address.state}{' '}
                  {siteConfig.contact.address.zip}
                </span>
              </li>
              <li>
                <a
                  href={siteConfig.contact.address.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Open Now (9 AM - 9 PM)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a
                  href={`tel:${account === 'studio' ? siteConfig.contact.studioPhone.replace(/[^0-9+]/g, '') : siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="hover:text-foreground"
                >
                  {account === 'studio' ? siteConfig.contact.studioPhone : siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-foreground"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal/Trust */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
            <ul className="mb-6 space-y-3">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground inline-block py-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Made by Creators for Creators
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Trusted by 500+ creative professionals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border pb-24 md:pb-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                title="Admin Dashboard"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="sr-only">Admin Dashboard</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Built with ❤️ by{' '}
                <a
                  href="https://xlevelsup.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  XLevelsUp
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
