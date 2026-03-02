'use client';

import Link from 'next/link';
import { Camera, Video, Building2, Mic, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';

const navItems = [
  { label: 'Photography', href: '/photography', icon: Camera },
  { label: 'Rentals', href: '/rentals', icon: Video },
  { label: 'Studio', href: '/studio', icon: Building2 },
  { label: 'Podcast', href: '/podcast', icon: Mic },
];

export function MainNav() {
  return (
    <nav
      className='
      fixed top-0 z-40 w-full
      border-b border-primary/12
      bg-[rgba(10,10,11,0.85)] backdrop-blur-xl
    '
    >
      <div className='container mx-auto flex h-20 items-center justify-between px-6'>
        {/* Logo */}
        <Link href='/' className='group flex items-center gap-2'>
          <span
            className='
            text-xl font-bold text-white transition-all duration-300
            group-hover:text-gradient-gold md:text-2xl
          '
          >
            {siteConfig.name}
          </span>
        </Link>

        {/* Nav links */}
        <ul className='hidden items-center gap-8 md:flex'>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className='
                  flex items-center gap-2
                  text-sm text-foreground/55
                  transition-colors duration-200
                  hover:text-primary
                '
              >
                <item.icon className='h-3.5 w-3.5' />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={generateWhatsAppLink()}
          target='_blank'
          rel='noopener noreferrer'
          className='
            flex items-center gap-2 rounded-full
            border border-primary/35
            bg-primary/8
            px-5 py-2.5 text-sm font-semibold text-primary
            transition-all duration-200
            hover:bg-primary/18 hover:border-primary/60
            hover:text-white hover:shadow-[0_0_20px_hsl(var(--primary)/0.20)]
          '
        >
          <MessageCircle className='h-4 w-4' />
          <span className='hidden sm:inline'>Contact</span>
        </a>
      </div>
    </nav>
  );
}
