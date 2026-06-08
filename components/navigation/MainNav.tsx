'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Camera, Video, Building2, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';

import { usePathname } from 'next/navigation';

const navItems: any[] = [];

export function MainNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav
      className="
      fixed top-0 z-40 w-full
      border-b border-primary/12
      bg-black backdrop-blur-xl
    "
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/wkfulllogo.png"
            alt={siteConfig.name}
            width={320}
            height={80}
            className="h-20 w-auto transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>

        {/* Nav links */}
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


      </div>
    </nav>
  );
}
