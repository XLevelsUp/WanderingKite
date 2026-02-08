'use client';

import Link from 'next/link';
import { Camera, Video, Building2, Mic } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';

const navItems = [
  { label: 'Photography', href: '/photography', icon: Camera },
  { label: 'Rentals', href: '/rentals', icon: Video },
  { label: 'Studio', href: '/studio', icon: Building2 },
  { label: 'Podcast', href: '/podcast', icon: Mic },
];

export function MainNav() {
  return (
    <nav className='fixed top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl'>
      <div className='container mx-auto flex h-20 items-center justify-between px-6'>
        <Link href='/' className='text-xl font-bold text-white md:text-2xl'>
          Wandering Kite
        </Link>

        <ul className='hidden items-center gap-8 md:flex'>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className='flex items-center gap-2 text-zinc-400 transition-colors hover:text-white'
              >
                <item.icon className='h-4 w-4' />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={generateWhatsAppLink()}
          target='_blank'
          rel='noopener noreferrer'
          className='rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-500'
        >
          Contact
        </a>
      </div>
    </nav>
  );
}
