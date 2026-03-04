'use client';

/**
 * components/layout/nav-studio.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Studio Navigation — Wandering Kite ERP
 *
 * Architecture:
 *  - Desktop: Nested Radix UI DropdownMenu with sub-menus per service domain
 *  - Mobile:  Radix UI Dialog (sheet variant) with accordion-style domain list
 *  - Data:    Reads from SERVICE_REGISTRY — zero prop-drilling
 *  - Styling: Tailwind CSS, inherits existing dark-mode CSS tokens
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Camera,
    Briefcase,
    Clapperboard,
    Building2,
    ChevronDown,
    MessageCircle,
    Menu,
    X,
    ArrowRight,
} from 'lucide-react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';
import { SERVICE_REGISTRY, type ServiceDomain, type ServiceGroup } from '@/types/studio';

// ──────────────────────────────────────────────────────────────────────────────
// Icon resolver
// ──────────────────────────────────────────────────────────────────────────────

const DOMAIN_ICONS: Record<string, React.ElementType> = {
    Camera,
    Briefcase,
    Clapperboard,
    Building2,
};

function DomainIcon({ name, className }: { name: string; className?: string }) {
    const Icon = DOMAIN_ICONS[name] ?? Building2;
    return <Icon className={className} />;
}

// ──────────────────────────────────────────────────────────────────────────────
// § Desktop — Nested dropdown for a single domain
// ──────────────────────────────────────────────────────────────────────────────

interface DomainDropdownProps {
    domainKey: string;
    domain: ServiceDomain;
    isActive: boolean;
}

function DomainDropdown({ domainKey, domain, isActive }: DomainDropdownProps) {
    return (
        <DropdownMenuPrimitive.Root>
            <DropdownMenuPrimitive.Trigger asChild>
                <button
                    className={cn(
                        'group flex items-center gap-1.5 text-sm font-medium',
                        'text-foreground/55 transition-all duration-200 outline-none',
                        'hover:text-primary focus-visible:text-primary',
                        isActive && 'text-primary',
                    )}
                    aria-label={`${domain.label} services`}
                >
                    <DomainIcon name={domain.iconName} className="h-3.5 w-3.5" />
                    {domain.label}
                    <ChevronDown
                        className={cn(
                            'h-3 w-3 transition-transform duration-200',
                            'group-data-[state=open]:rotate-180',
                        )}
                    />
                </button>
            </DropdownMenuPrimitive.Trigger>

            <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                    sideOffset={16}
                    align="start"
                    className={cn(
                        'z-50 min-w-[260px] overflow-hidden rounded-xl',
                        'border border-white/8 bg-[rgba(14,14,16,0.96)]',
                        'shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[side=bottom]:slide-in-from-top-2',
                        'origin-[--radix-dropdown-menu-content-transform-origin]',
                    )}
                >
                    {/* Domain header */}
                    <div className="px-3 pt-3 pb-2">
                        <Link
                            href={domain.href}
                            className="group/header flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/12">
                                <DomainIcon name={domain.iconName} className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-white">{domain.label}</p>
                                <p className="text-[10px] text-foreground/40">View all services</p>
                            </div>
                            <ArrowRight className="h-3 w-3 text-foreground/30 transition-all group-hover/header:translate-x-0.5 group-hover/header:text-primary" />
                        </Link>
                    </div>

                    <div className="mx-3 h-px bg-white/6" />

                    {/* Service groups */}
                    <div className="p-2">
                        {domain.groups.map((group: ServiceGroup) => (
                            <div key={group.label} className="mb-1 last:mb-0">
                                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
                                    {group.label}
                                </p>
                                {group.items.map((item) => (
                                    <DropdownMenuPrimitive.Item key={item.slug} asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'group/item flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2',
                                                'text-foreground/60 outline-none transition-all duration-150',
                                                'hover:bg-primary/8 hover:text-white focus:bg-primary/8 focus:text-white',
                                            )}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium leading-none">{item.label}</p>
                                                <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/40 group-hover/item:text-foreground/55 truncate">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </Link>
                                    </DropdownMenuPrimitive.Item>
                                ))}
                            </div>
                        ))}
                    </div>
                </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// § Mobile — Accordion-style domain list inside a Dialog sheet
// ──────────────────────────────────────────────────────────────────────────────

interface MobileDomainAccordionProps {
    domainKey: string;
    domain: ServiceDomain;
    onClose: () => void;
}

function MobileDomainAccordion({ domainKey, domain, onClose }: MobileDomainAccordionProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="border-b border-white/8 last:border-0">
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'flex w-full items-center justify-between px-4 py-3.5',
                    'text-sm font-medium text-foreground/70 transition-colors',
                    'hover:text-white',
                    open && 'text-white',
                )}
                aria-expanded={open}
            >
                <span className="flex items-center gap-2.5">
                    <DomainIcon name={domain.iconName} className="h-4 w-4 text-primary/70" />
                    {domain.label}
                </span>
                <ChevronDown
                    className={cn(
                        'h-3.5 w-3.5 text-foreground/40 transition-transform duration-200',
                        open && 'rotate-180',
                    )}
                />
            </button>

            {open && (
                <div className="pb-2">
                    {/* Domain overview link */}
                    <Link
                        href={domain.href}
                        onClick={onClose}
                        className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-2 text-xs font-medium text-primary"
                    >
                        <ArrowRight className="h-3 w-3" />
                        View all {domain.label} services
                    </Link>

                    {domain.groups.map((group) => (
                        <div key={group.label} className="px-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
                                {group.label}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg px-3 py-2.5',
                                            'text-sm text-foreground/60 transition-colors',
                                            'hover:bg-white/5 hover:text-white',
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// § Mobile — Full sheet
// ──────────────────────────────────────────────────────────────────────────────

function MobileSheet() {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();

    // Close on route change
    React.useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
                <button
                    className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        'border border-white/10 bg-white/5 text-foreground/70',
                        'transition-all duration-200 hover:bg-white/10 hover:text-white',
                        'md:hidden',
                    )}
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-4.5 w-4.5" />
                </button>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                {/* Overlay */}
                <DialogPrimitive.Overlay
                    className={cn(
                        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                    )}
                />

                {/* Sheet panel — slides in from left */}
                <DialogPrimitive.Content
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col',
                        'bg-[rgba(10,10,12,0.97)] shadow-2xl backdrop-blur-xl',
                        'border-r border-white/8',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
                        'duration-300',
                    )}
                    aria-label="Navigation menu"
                >
                    {/* Sheet header */}
                    <div className="flex items-center justify-between border-b border-white/8 px-4 py-5">
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            className="text-lg font-bold text-white"
                        >
                            {siteConfig.name}
                        </Link>
                        <DialogPrimitive.Close asChild>
                            <button
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full',
                                    'border border-white/10 text-foreground/50',
                                    'transition-colors hover:bg-white/8 hover:text-white',
                                )}
                                aria-label="Close menu"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </DialogPrimitive.Close>
                    </div>

                    {/* Domain accordion list */}
                    <div className="flex-1 overflow-y-auto">
                        {Object.entries(SERVICE_REGISTRY).map(([key, domain]) => (
                            <MobileDomainAccordion
                                key={key}
                                domainKey={key}
                                domain={domain}
                                onClose={() => setOpen(false)}
                            />
                        ))}
                    </div>

                    {/* Sheet footer CTA */}
                    <div className="border-t border-white/8 p-4">
                        <a
                            href={generateWhatsAppLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            className={cn(
                                'flex w-full items-center justify-center gap-2 rounded-full',
                                'border border-primary/35 bg-primary/8',
                                'px-5 py-2.5 text-sm font-semibold text-primary',
                                'transition-all duration-200',
                                'hover:bg-primary/18 hover:border-primary/60 hover:text-white',
                            )}
                        >
                            <MessageCircle className="h-4 w-4" />
                            Contact via WhatsApp
                        </a>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// § Root — StudioNavigation (exported)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * StudioNavigation
 *
 * Enterprise navigation bar wired to the SERVICE_REGISTRY.
 * Supports nested dropdown sub-menus on desktop and a slide-in sheet on mobile.
 *
 * Usage:
 *   import { StudioNavigation } from '@/components/layout/nav-studio';
 *   // Place anywhere — designed to sit at the top of the page layout
 */
export function StudioNavigation() {
    const pathname = usePathname();

    return (
        <nav
            className={cn(
                'fixed top-0 z-40 w-full',
                'border-b border-primary/12',
                'bg-[rgba(10,10,11,0.85)] backdrop-blur-xl',
            )}
        >
            <div className="container mx-auto flex h-20 items-center justify-between px-6">

                {/* ── Logo ─────────────────────────────────────────────────────── */}
                <Link href="/" className="group flex items-center gap-2">
                    <span
                        className={cn(
                            'text-xl font-bold text-white transition-all duration-300',
                            'group-hover:text-gradient-gold md:text-2xl',
                        )}
                    >
                        {siteConfig.name}
                    </span>
                </Link>

                {/* ── Desktop nav ──────────────────────────────────────────────── */}
                <ul className="hidden items-center gap-6 md:flex" role="menubar">
                    {Object.entries(SERVICE_REGISTRY).map(([key, domain]) => {
                        const isActive = pathname.startsWith(domain.href) && domain.href !== '/';
                        return (
                            <li key={key} role="none">
                                <DomainDropdown domainKey={key} domain={domain} isActive={isActive} />
                            </li>
                        );
                    })}
                </ul>

                {/* ── Right zone: CTA + Mobile trigger ─────────────────────────── */}
                <div className="flex items-center gap-3">
                    <a
                        href={generateWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'flex items-center gap-2 rounded-full',
                            'border border-primary/35 bg-primary/8',
                            'px-5 py-2.5 text-sm font-semibold text-primary',
                            'transition-all duration-200',
                            'hover:bg-primary/18 hover:border-primary/60',
                            'hover:text-white hover:shadow-[0_0_20px_hsl(var(--primary)/0.20)]',
                        )}
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Contact</span>
                    </a>

                    {/* Mobile hamburger — hidden on md+ */}
                    <MobileSheet />
                </div>

            </div>
        </nav>
    );
}
