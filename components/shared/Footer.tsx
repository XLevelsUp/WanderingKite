'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Mail,
  Phone,
  Instagram,
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

// Brand glyphs (simple-icons) + brand hover colours, shared by both footers
const socialIcons = {
  youtube: {
    hover: 'hover:border-[#FF0000]/50 hover:text-[#FF0000]',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  instagram: {
    hover: 'hover:border-[#E4405F]/50 hover:text-[#E4405F]',
    path: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  },
  facebook: {
    hover: 'hover:border-[#1877F2]/50 hover:text-[#1877F2]',
    path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  },
  x: {
    hover: 'hover:border-foreground/60 hover:text-foreground',
    path: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
  },
  linkedin: {
    hover: 'hover:border-[#0A66C2]/50 hover:text-[#0A66C2]',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
  },
  reddit: {
    hover: 'hover:border-[#FF4500]/50 hover:text-[#FF4500]',
    path: 'M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z',
  },
};

// Studio Space Coimbatore social profiles (shown on the studio footer)
const studioSocials = [
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UCipYvjCuuNhnPgRFzzmY1ng', ...socialIcons.youtube },
  { name: 'Instagram', href: 'https://instagram.com/studiospacecbe', ...socialIcons.instagram },
  { name: 'Facebook', href: 'https://facebook.com/Studiospacecbe', ...socialIcons.facebook },
  { name: 'X', href: 'https://x.com/studiospacecbe', ...socialIcons.x },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/131383996/', ...socialIcons.linkedin },
  { name: 'Reddit', href: 'https://www.reddit.com/user/WK_StudioSpace', ...socialIcons.reddit },
];

// Wandering Kite (main brand) social profiles (shown on all non-studio footers)
const brandSocials = [
  { name: 'YouTube', href: 'https://youtube.com/@wanderingkite', ...socialIcons.youtube },
  { name: 'Instagram', href: 'https://instagram.com/wanderingkitestudio', ...socialIcons.instagram },
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61590166620911', ...socialIcons.facebook },
  { name: 'X', href: 'https://x.com/Photography_wk', ...socialIcons.x },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/wandering-kite-photography/', ...socialIcons.linkedin },
  { name: 'Reddit', href: 'https://www.reddit.com/user/wanderingkite_cbe', ...socialIcons.reddit },
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
