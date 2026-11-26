// Server component: the footer is static markup on every page, so it no longer ships as client JS
// (less hydration work). Only the live "Open now" label (OpenNowStatus) and InstagramFeed run in the browser.
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Mail,
  Phone,
  Instagram,
  Clock,
} from 'lucide-react';
import { openingHoursLines } from '@/lib/hours';
import { siteConfig } from '@/config/site';
import { brandSocials, studioSocials } from '@/lib/socials';
import { InstagramFeed } from './InstagramFeed';
import { OpenNowStatus } from './OpenNowStatus';
import { legalLinksFor } from '@/lib/theme/studioRoutes';

const services = [
  { name: 'Photography', href: '/photography' },
  //{ name: "Equipment Rentals", href: "/rentals" },
  { name: 'Studio Space', href: '/studiospace' },
  { name: 'Podcast Studio', href: '/studiospace#podcast' },
];



interface FooterProps {
  account?: 'wanderingkite' | 'studio';
  /** false where the page already shows its own Instagram section (the homepage), so it isn't shown twice. */
  showInstagram?: boolean;
  /** 'sandstone' = revamp footer (homepage): sandstone ground, black text. Other pages keep the default. */
  tone?: 'default' | 'sandstone';
  /** Photography pages pass 'photography': photography tagline + Photography Terms only (was read from the URL client-side). */
  section?: 'photography';
}

// Sandstone tone: re-points theme variables for this subtree only, so existing token classes follow.
const SANDSTONE_VARS = {
  '--background': '32 27% 72%',
  '--muted-foreground': '0 0% 16%',
  '--border': '27 17% 53%',
  '--card': '42 31% 94%',
  // Taupe links (e.g. "Open in Google Maps") fail on sandstone — deepen it within the footer only.
  '--primary': '27 20% 28%',
} as React.CSSProperties;

export function Footer({ account = 'wanderingkite', showInstagram = true, tone = 'default', section }: FooterProps) {
  const photography = section === 'photography';
  // Same links as before, now chosen from props instead of the URL: studio pages → Studio Terms,
  // photography pages → Photography Terms, everything else → both.
  const legal = legalLinksFor(account === 'studio' ? '/studiospace' : photography ? '/photography' : null, siteConfig.features.rentals);

  // The old early-return that hid this footer on /dashboard and /admin is gone:
  // both prefixes moved to apps/admin in the split, so no path in this app can
  // match them any more.

  return (
    <footer className="border-t border-border bg-background text-foreground" style={tone === 'sandstone' ? SANDSTONE_VARS : undefined}>
      {/* Instagram Follow CTA */}
      {/* Porcelain mist band rather than the old purple/pink/orange gradient:
          Instagram's own brand colours sit outside this palette and fought
          with the brand orange. The band is set apart by surface, not hue. */}
      {/* The rental promo shows only while rentals are actually offered (siteConfig.features.rentals). */}
      {showInstagram && siteConfig.features.rentals && (
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 flex justify-center">
              <Instagram className="h-12 w-12 text-primary" />
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
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
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
      )}

      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Socials */}
          <div>
            <Link href={account === 'studio' ? '/studiospace' : '/'} className="mb-4 inline-block group">
              <Image
                // Studio Space uses its own logo; photography and landing pages keep the light WK logo.
                // 480px copy of the WK logo (shown ~265px wide): 5KB instead of the 15KB 1125px original.
                src={account === 'studio' ? '/studio-space-logo.webp' : '/wk-logo-light-480.png'}
                alt={account === 'studio' ? 'Studio Space Coimbatore' : siteConfig.name}
                width={account === 'studio' ? 214 : 480}
                height={account === 'studio' ? 100 : 145}
                className="h-20 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="mb-6 text-sm text-muted-foreground">
              {photography
                ? 'Stories in Light — candid wedding, event, portrait and commercial photography from RS Puram, Coimbatore.'
                : 'Creative infrastructure for modern creators. Empowering your vision with professional gear and spaces.'}
            </p>
            <div className="flex flex-nowrap gap-2">
              {(account === 'studio' ? studioSocials : brandSocials).map(
                (social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors ${social.hover}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                )
              )}
            </div>
          </div>

          {/* Column 2: Service Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Services</h3>
            <ul className="space-y-3">
              {[
                ...services,
                // Each section links to its own blog.
                account === 'studio'
                  ? { name: 'Blog', href: '/studiospace/blog' }
                  : { name: 'Blog', href: '/blog' },
              ].map((service) => (
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
                  className={`inline-flex items-center gap-2 text-primary hover:text-primary/75 ${tone === 'sandstone' ? 'underline decoration-1 underline-offset-4' : ''}`}
                >
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  <OpenNowStatus />
                  {openingHoursLines().map((l) => (
                    <span key={l} className="block">{l}</span>
                  ))}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="space-y-1">
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                    className="block hover:text-foreground"
                  >
                    <span className="text-foreground/70">Photography:</span> {siteConfig.contact.phone}
                  </a>
                  <a
                    href={`tel:${siteConfig.contact.studioPhone.replace(/[^0-9+]/g, '')}`}
                    className="block hover:text-foreground"
                  >
                    <span className="text-foreground/70">Studio Space:</span> {siteConfig.contact.studioPhone}
                  </a>
                </div>
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
              {/* No staff/admin link here on purpose: staff go to the admin app directly (audit 2026-11-12). */}
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
