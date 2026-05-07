"use client";

import Link from "next/link";
import Image from "next/image";
import { Camera, Video, Building2, MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

const navItems = [
  { label: "Photography", href: "/photography", icon: Camera },
  // { label: 'Rentals', href: '/rentals', icon: Video },
  { label: "The Studio Space", href: "/studio", icon: Building2 },
];

export function MainNav() {
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

        {/* CTA */}
        <a
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-2 rounded-full
            border border-primary/35
            bg-primary/8
            px-5 py-2.5 text-sm font-semibold text-primary
            transition-all duration-200
            hover:bg-primary/18 hover:border-primary/60
            hover:text-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.20)]
          "
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Contact</span>
        </a>
      </div>
    </nav>
  );
}
