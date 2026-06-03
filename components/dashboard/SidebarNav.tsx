'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Users,
  Calendar,
  Wallet,
  ShieldCheck,
  FolderKanban,
  Activity,
  GitBranch,
  ArrowLeftCircle,
} from 'lucide-react';

interface SidebarNavProps {
  profile: {
    role: string;
    full_name?: string | null;
  } | null;
  email: string;
}

export function SidebarNav({ profile, email }: SidebarNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

  // Standard main dashboard items
  const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/portfolio', label: 'Portfolio', icon: FolderKanban },
    { href: '/dashboard/equipment', label: 'Equipment', icon: Briefcase },
    { href: '/dashboard/clients', label: 'Clients', icon: Users },
    { href: '/dashboard/rentals', label: 'Rentals', icon: Wallet },
    { href: '/dashboard/employees', label: 'Employees', icon: Users },
  ];

  const adminNavItems = [
    { href: '/dashboard/deployments', label: 'Field Ops', icon: Activity },
    { href: '/dashboard/categories', label: 'Categories', icon: Layers },
    { href: '/dashboard/branches', label: 'Branches', icon: GitBranch },
  ];

  // The 3 sub-categories of HR and Payroll
  const subCategories = [
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/attendance', label: 'Attendance', icon: Calendar },
    { href: '/admin/payroll', label: 'Payroll', icon: Wallet },
  ];

  if (isExpanded) {
    return (
      <nav className='space-y-1.5 animate-in fade-in duration-200'>
        <button
          onClick={() => setIsExpanded(false)}
          className='w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 hover:bg-primary/18 transition-all duration-150 group'
        >
          <ArrowLeftCircle className='w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform' />
          Return to Dashboard
        </button>

        <div className='space-y-1 mt-2'>
          <p className='px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-primary/45 mb-2'>
            HR & Payroll
          </p>
          {subCategories.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <a
                key={sub.href}
                href={sub.href}
                className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/70 hover:text-primary hover:bg-primary/8 transition-all duration-150'
              >
                <SubIcon className='w-4 h-4 opacity-75' />
                {sub.label}
              </a>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className='space-y-1.5 animate-in fade-in duration-200'>
      {/* Render Main Navigation Links */}
      {mainNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.href}
            href={item.href}
            className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
          >
            <Icon className='w-4 h-4 opacity-75' />
            {item.label}
          </a>
        );
      })}

      {/* Admin Specific Links */}
      {isAdmin &&
        adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
            >
              <Icon className='w-4 h-4 opacity-75' />
              {item.label}
            </a>
          );
        })}

      {/* Super Admin Audit Logs */}
      {isSuperAdmin && (
        <a
          href='/dashboard/audit-logs'
          className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
        >
          <ShieldCheck className='w-4 h-4 opacity-75' />
          Audit Logs
        </a>
      )}

      {/* HR & Payroll Section Button */}
      {isAdmin && (
        <div className='pt-3 pb-1 border-t border-primary/10 mt-3 space-y-1'>
          <p className='px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-primary/45 mb-2'>
            Modules
          </p>

          <button
            onClick={() => setIsExpanded(true)}
            className='w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
          >
            <span className='flex items-center gap-3'>
              <Users className='w-4 h-4 opacity-75' />
              HR & Payroll
            </span>
          </button>
        </div>
      )}
    </nav>
  );
}
