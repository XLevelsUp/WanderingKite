'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, Video, Building2, MessageCircle, User } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/dashboard/NotificationBell';

const navItems = [
  { label: 'Photography', href: '/photography', icon: Camera },
  { label: 'Rentals', href: '/rentals', icon: Video },
  { label: 'The Studio Space', href: '/studiospace', icon: Building2 },
];

export function MainNav() {
  const pathname = usePathname();
  const isDashboardOrAdmin = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || false;
  const isAuthPage = pathname === '/login' || pathname === '/client/login' || pathname === '/client/signup';

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

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
      className="
      fixed top-0 z-40 w-full
      border-b border-primary/12
      bg-black backdrop-blur-xl
    "
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <Image
            src="/wkfulllogo.png"
            alt={siteConfig.name}
            width={320}
            height={80}
            className="h-10 sm:h-16 md:h-20 w-auto transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>

        {/* Nav links */}
        {isDashboardOrAdmin ? (
          <div className="flex items-center gap-4 shrink-0">
            <NotificationBell />
          </div>
        ) : (
          <>
            <ul className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="
                      flex items-center gap-2
                      text-sm text-foreground/55
                      transition-colors duration-200
                      hover:text-primary
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
                  className="
                    flex h-9 sm:h-10 items-center gap-1.5 rounded-full
                    border border-primary/35
                    bg-primary/8
                    px-3 sm:px-4 text-xs sm:text-sm font-semibold text-primary
                    transition-all duration-200
                    hover:bg-primary/18 hover:border-primary/60
                    hover:text-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.20)]
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
                  flex h-9 sm:h-10 items-center gap-1.5 rounded-full
                  border border-primary/35
                  bg-primary/8
                  px-3 sm:px-4 text-xs sm:text-sm font-semibold text-primary
                  transition-all duration-200
                  hover:bg-primary/18 hover:border-primary/60
                  hover:text-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.20)]
                  hidden sm:flex
                "
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">Contact</span>
              </a>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
