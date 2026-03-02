'use client';

import Link from 'next/link';
import {
  MapPin,
  Mail,
  Phone,
  Instagram,
  Youtube,
  Linkedin,
  Clock,
} from 'lucide-react';
import { siteConfig } from '@/config/site';

const services = [
  { name: 'Photography', href: '/photography' },
  { name: 'Equipment Rentals', href: '/rentals' },
  { name: 'Studio Space', href: '/studio' },
  { name: 'Podcast Studio', href: '/podcast' },
];

const legal = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Rental Terms', href: '/terms' },
  { name: 'Refund Policy', href: '/refunds' },
];

export function Footer() {
  return (
    <footer className='border-t border-zinc-800 bg-zinc-950'>
      {/* Instagram Follow CTA */}
      <div className='border-b border-zinc-800 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20'>
        <div className='container mx-auto px-6 py-12'>
          <div className='mx-auto max-w-2xl text-center'>
            <div className='mb-4 flex justify-center'>
              <Instagram className='h-12 w-12 text-pink-500' />
            </div>
            <h3 className='mb-2 text-2xl font-bold'>
              Get 10% Off Your First Rental
            </h3>
            <p className='mb-6 text-zinc-400'>
              Follow us on Instagram for exclusive deals, behind-the-scenes
              content, and creative inspiration
            </p>
            <a
              href={siteConfig.links.instagram}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-semibold text-white transition-all hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-pink-500/50'
            >
              <Instagram className='h-5 w-5' />
              Follow @{siteConfig.name.toLowerCase().replace(/\s+/g, '')}
            </a>
            <p className='mt-4 text-xs text-zinc-500'>
              DM us "FIRST10" after following to claim your discount
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className='container mx-auto px-6 py-16'>
        <div className='grid gap-12 md:grid-cols-2 lg:grid-cols-4'>
          {/* Column 1: Brand & Socials */}
          <div>
            <h2 className='mb-4 text-2xl font-bold'>{siteConfig.name}</h2>
            <p className='mb-6 text-sm text-zinc-400'>
              Creative infrastructure for modern creators. Empowering your
              vision with professional gear and spaces.
            </p>
            <div className='flex gap-4'>
              <a
                href={siteConfig.links.instagram}
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white'
                aria-label='Instagram'
              >
                <Instagram className='h-5 w-5' />
              </a>
              <a
                href={siteConfig.links.youtube}
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white'
                aria-label='YouTube'
              >
                <Youtube className='h-5 w-5' />
              </a>
              <a
                href={siteConfig.links.linkedin}
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white'
                aria-label='LinkedIn'
              >
                <Linkedin className='h-5 w-5' />
              </a>
            </div>
          </div>

          {/* Column 2: Service Quick Links */}
          <div>
            <h3 className='mb-4 font-semibold text-white'>Services</h3>
            <ul className='space-y-3'>
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className='text-sm text-zinc-400 transition-colors hover:text-white'
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Local SEO/Contact */}
          <div>
            <h3 className='mb-4 font-semibold text-white'>Visit Us</h3>
            <ul className='space-y-3 text-sm text-zinc-400'>
              <li className='flex items-start gap-2'>
                <MapPin className='mt-0.5 h-4 w-4 flex-shrink-0' />
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
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-blue-400 hover:text-blue-300'
                >
                  <MapPin className='h-4 w-4' />
                  Open in Google Maps
                </a>
              </li>
              <li className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                <span className='flex items-center gap-2'>
                  <span className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                  Open Now (9 AM - 9 PM)
                </span>
              </li>
              <li className='flex items-center gap-2'>
                <Phone className='h-4 w-4' />
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                  className='hover:text-white'
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className='flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className='hover:text-white'
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal/Trust */}
          <div>
            <h3 className='mb-4 font-semibold text-white'>Legal</h3>
            <ul className='mb-6 space-y-3'>
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className='text-sm text-zinc-400 transition-colors hover:text-white'
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
              <p className='text-xs text-zinc-500'>
                Made by Creators for Creators
              </p>
              <p className='mt-2 text-xs text-zinc-600'>
                Trusted by 500+ creative professionals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-zinc-800'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <p className='text-sm text-zinc-500'>
              © {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved.
            </p>
            <p className='text-sm text-zinc-600'>
              Built with ❤️ by{' '}
              <a
                href='https://xlevelsup.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-zinc-400 hover:text-white'
              >
                XLevelsUp
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
