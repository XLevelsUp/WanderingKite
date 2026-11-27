'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Camera, Video, Building2, MessageCircle, User, Menu, X } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';
import { usePathname } from 'next/navigation';
import { isStudioRoute } from '@/lib/theme/studioRoutes';

const navItems = [
  { label: 'Photography', href: '/photography', icon: Camera },
  { label: 'Rentals', href: '/rentals', icon: Video },
  { label: 'Studio Space Coimbatore', href: '/studiospace', icon: Building2 },
].filter((item) => item.href !== '/rentals' || siteConfig.features.rentals); // Rentals toggled in config/site.ts

export function MainNav() {
  const pathname = usePathname();
  // Only the client-portal auth pages exist in this app now — the staff /login
  // and the /dashboard and /admin prefixes moved to apps/admin in the split, so
  // the branch that rendered the staff NotificationBell here could never match.
  const isAuthPage = pathname === '/client/login' || pathname === '/client/signup';

  const studio = isStudioRoute(pathname);

  // Theme <html> too on studio routes, so the page background and overscroll are dark as well.
  React.useEffect(() => {
    const root = document.documentElement;
    if (studio) root.dataset.theme = 'studio';
    else delete root.dataset.theme;
    // CSS transitions are held back until this point (html:not(.tx-ready) in globals.css): applying the theme flips the
    // colour scheme, and without the hold every transition-colors element animated light → dark during load.
    // Two frames later the new colours have painted, so transitions can switch on for real interactions.
    if (!root.classList.contains('tx-ready')) {
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('tx-ready')));
    }
  }, [studio]);

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Close the drawer on route change, so tapping a link doesn't leave it open.
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  React.useEffect(() => {
    fetch('/api/client/session')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Not authenticated');
      })
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  return (
    <nav
      data-theme={studio ? 'studio' : undefined}
      /* Translucent bar with blur; colours follow the route theme (light, or dark on studio routes). */
      className="
      fixed top-0 z-40 w-full
      border-b border-border
      bg-background/85 backdrop-blur-xl
    "
    >
      {/* Same width steps as the page sections, so the nav lines up with content on large monitors. */}
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16">
        {/* Logo (+ on studio routes, a way back to the main Wandering Kite home page) */}
        <div className="flex shrink-0 items-center gap-4">
          <Link href={studio ? '/studiospace' : '/'} className="group flex items-center gap-2 shrink-0">
            <Image
              // Studio routes use the Studio Space Coimbatore logo; photography and landing pages keep the light WK logo.
              // 480px copy of the WK logo (shown ~120-160px wide): 5KB instead of the 15KB 1125px original.
              src={studio ? '/studio-space-logo.webp' : '/wk-logo-light-480.png'}
              alt={studio ? 'Studio Space Coimbatore' : siteConfig.name}
              width={studio ? 269 : 480}
              height={studio ? 100 : 145}
              // Logo height capped below the 80px bar so it keeps clear space.
              className={`${studio ? 'h-12 sm:h-14 3xl:h-16' : 'h-9 sm:h-11 3xl:h-12'} w-auto transition-transform duration-300 group-hover:scale-105`}
              priority
            />
          </Link>
          {/* The studio logo stays on the studio; this small link is the one-click way back to the main home page.
              Desktop/tablet only — phones get the same link as the first item in the menu. */}
          {studio && (
            <Link
              href="/"
              className="group hidden items-center gap-1.5 whitespace-nowrap border-l border-border pl-4 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/75 transition-colors duration-200 hover:text-accent-text sm:flex"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
              Wandering Kite
            </Link>
          )}
        </div>

        {/* Nav links */}
        <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                // whitespace-nowrap: "The Studio Space" broke onto 3 lines when cramped.
                className="
                  flex items-center gap-2 whitespace-nowrap
                  text-sm text-foreground
                  transition-colors duration-200
                  hover:text-accent-text
                "
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA & Client Auth Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isAuthPage && (
            <Link
              href={isAuthenticated ? "/client/dashboard" : "/client/login"}
              // Desktop only: on mobile this lives in the drawer instead.
              className="
                hidden lg:flex h-9 sm:h-10 items-center gap-1.5 whitespace-nowrap rounded-full
                bg-primary
                px-3 sm:px-4 text-xs sm:text-sm font-semibold text-primary-foreground
                transition-all duration-200
                hover:bg-primary/85
                hover:shadow-[0_8px_24px_hsl(var(--primary)/0.35)]
              "
            >
              {isAuthenticated && <User className="h-4 w-4 shrink-0" />}
              {isAuthenticated ? "My Dashboard" : "Client Login/Signup"}
            </Link>
          )}
          <a
            href={generateWhatsAppLink(pathname === '/studiospace' ? 'studio' : undefined)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on WhatsApp"
            className="
              flex h-9 sm:h-10 items-center gap-1.5 whitespace-nowrap rounded-full
              bg-primary

              px-3 sm:px-4 text-xs sm:text-sm font-semibold text-primary-foreground
              transition-all duration-200
              hover:bg-primary/85
              hover:shadow-[0_8px_24px_hsl(var(--primary)/0.35)]
              hidden lg:flex
            "
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>Contact</span>
          </a>

          {/* Hamburger — the only way to reach the nav links below `md`. */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="
              flex h-10 w-10 items-center justify-center rounded-full
              text-foreground transition-colors duration-200
              hover:bg-accent lg:hidden
            "
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={`
          overflow-hidden border-t border-border bg-background lg:hidden
          transition-[max-height] duration-300 ease-out
          ${menuOpen ? 'max-h-[32rem]' : 'max-h-0 border-t-0'}
        `}
      >
        <ul className="container mx-auto flex flex-col px-4 py-2 sm:px-6">
          {/* Studio routes: first item goes back to the main Wandering Kite home page. */}
          {studio && (
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 border-b border-border/60 py-4 text-base text-foreground transition-colors duration-200 hover:text-accent-text"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Wandering Kite home
              </Link>
            </li>
          )}
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="
                  flex items-center gap-3 border-b border-border/60 py-4
                  text-base text-foreground
                  transition-colors duration-200 hover:text-accent-text
                "
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          ))}
          <li className="mt-4 flex flex-col gap-3 pb-5">
            <a
              href={generateWhatsAppLink(pathname === '/studiospace' ? 'studio' : undefined)}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex h-11 items-center justify-center gap-2 rounded-full
                bg-primary text-sm font-semibold text-primary-foreground
                transition-all duration-200 hover:bg-primary/85
              "
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Contact
            </a>
            {!isAuthPage && (
              <Link
                href={isAuthenticated ? '/client/dashboard' : '/client/login'}
                className="
                  flex h-11 items-center justify-center gap-2 rounded-full
                  border border-primary text-sm font-semibold text-foreground
                  transition-all duration-200 hover:bg-accent
                "
              >
                {isAuthenticated && <User className="h-4 w-4 shrink-0" />}
                {isAuthenticated ? 'My Dashboard' : 'Client Login/Signup'}
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
