'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
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
  Wrench,
  ShieldAlert,
  HardDrive,
  Receipt,
  Tag,
  FileText,
} from 'lucide-react';
import { getNavAccess } from '@/lib/access';

interface SidebarNavProps {
  profile: {
    role: string;
    full_name?: string | null;
  } | null;
  email: string;
}

export function SidebarNav({ profile, email }: SidebarNavProps) {
  const pathname = usePathname();
  const isHRRoute = (p: string | null) => !!p && p.startsWith('/hr');
  const [isExpanded, setIsExpanded] = useState(() => isHRRoute(pathname));
  const router = useRouter();

  useEffect(() => {
    setIsExpanded(isHRRoute(pathname));
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const getLinkClasses = (path: string) => {
    return `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-150 ${
      isActive(path)
        ? 'text-primary bg-primary/10 font-medium'
        : 'text-foreground/60 hover:text-primary hover:bg-primary/8'
    }`;
  };

  const access = getNavAccess(profile?.role ?? 'EMPLOYEE');

  // The 3 sub-categories of HR and Payroll
  const subCategories = [
    { href: '/hr/employees', label: 'Employees', icon: Users },
    { href: '/hr/attendance', label: 'Attendance', icon: Calendar },
    { href: '/hr/payroll', label: 'Payroll', icon: Wallet },
  ];

  if (isExpanded) {
    return (
      <nav className='space-y-1.5 animate-in fade-in duration-200'>
        <div className='mb-8'>
          <h1 className='text-xl font-bold text-gradient-brand'>HR & Payroll</h1>
        </div>
        <a
          href="/"
          className='w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 hover:bg-primary/18 transition-all duration-150 group'
        >
          <ArrowLeftCircle className='w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform' />
          Return to Main Menu
        </a>

        <div className='space-y-1 mt-2'>
          <p className='px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-primary/45 mb-2'>
            HR & Payroll
          </p>
          {subCategories.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className={getLinkClasses(sub.href)}
              >
                <SubIcon className='w-4 h-4 opacity-75' />
                {sub.label}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className='space-y-1.5 animate-in fade-in duration-200'>
      <div className='mb-8'>
        <h1 className='text-xl font-bold text-gradient-brand'>Main Menu</h1>
      </div>
      {/* Always visible: Overview */}
      <Link
        href='/'
        className={getLinkClasses('/')}
      >
        <LayoutDashboard className='w-4 h-4 opacity-75' />
        Dashboard
      </Link>

      {/* Employee-visible: Own profile */}
      {access.canViewEmployees && (
        <Link
          href='/employees'
          className={getLinkClasses('/employees')}
        >
          <Users className='w-4 h-4 opacity-75' />
          Employees
        </Link>
      )}

      {/* Employee-visible: Personal HR */}
      {access.canViewOwnAttendance && (
        <Link
          href='/attendance'
          className={getLinkClasses('/attendance')}
        >
          <Calendar className='w-4 h-4 opacity-75' />
          My Attendance
        </Link>
      )}
      {access.canViewOwnPayslips && (
        <Link
          href='/payslips'
          className={getLinkClasses('/payslips')}
        >
          <Wallet className='w-4 h-4 opacity-75' />
          My Payslips
        </Link>
      )}

      {access.canViewAuditLogs && (
        <Link href='/audit-logs' className={getLinkClasses('/audit-logs')}>
          <ShieldAlert className='w-4 h-4 opacity-75' />
          Audit Logs
        </Link>
      )}

      {access.canViewBookingConflicts && (
        <Link href='/booking-conflicts' className={getLinkClasses('/booking-conflicts')}>
          <ShieldAlert className='w-4 h-4 opacity-75' />
          Booking Conflicts
        </Link>
      )}

      {/* Admin-only operational pages */}
      {profile?.role === 'SUPER_ADMIN' && (
        <Link href='/bookings' className={getLinkClasses('/bookings')}>
          <Calendar className='w-4 h-4 opacity-75' />
          Central Bookings
        </Link>
      )}
      {access.canViewPortfolio && (
        <Link href='/portfolio' className={getLinkClasses('/portfolio')}>
          <FolderKanban className='w-4 h-4 opacity-75' />
          Portfolio
        </Link>
      )}
      {access.canViewBlog && (
        <Link href='/blog' className={getLinkClasses('/blog')}>
          <FileText className='w-4 h-4 opacity-75' />
          Blog
        </Link>
      )}
      {access.canViewEquipment && (
        <Link href='/equipment' className={getLinkClasses('/equipment')}>
          <Briefcase className='w-4 h-4 opacity-75' />
          Equipment
        </Link>
      )}
      {access.canViewMediaTracker && (
        <Link href='/media-tracker' className={getLinkClasses('/media-tracker')}>
          <HardDrive className='w-4 h-4 opacity-75' />
          Media Tracker
        </Link>
      )}
      {access.canViewRentalSettings && (
        <Link href='/rental-settings' className={getLinkClasses('/rental-settings')}>
          <Wrench className='w-4 h-4 opacity-75' />
          Rental Settings
        </Link>
      )}
      {access.canViewStudioPricing && (
        <Link href='/studio-pricing' className={getLinkClasses('/studio-pricing')}>
          <Tag className='w-4 h-4 opacity-75' />
          Studio Pricing
        </Link>
      )}
      {access.canViewClients && (
        <Link href='/clients' className={getLinkClasses('/clients')}>
          <Users className='w-4 h-4 opacity-75' />
          Clients
        </Link>
      )}
      {access.canViewInvoices && (
        <Link href='/invoices' className={getLinkClasses('/invoices')}>
          <Receipt className='w-4 h-4 opacity-75' />
          Invoices
        </Link>
      )}
      {/* Rentals — hidden from UI
      {access.canViewRentals && (
        <a href='/rentals' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
          <Wallet className='w-4 h-4 opacity-75' />
          Rentals
        </a>
      )}
      */}
      {access.canViewDeployments && (
        <Link href='/fieldops' className={getLinkClasses('/fieldops')}>
          <Activity className='w-4 h-4 opacity-75' />
          Field Ops
        </Link>
      )}

      {/* Admin extras: Categories, Branches — hidden from UI
      {access.canViewAdminExtras && (
        <>
          <a href='/categories' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
            <Layers className='w-4 h-4 opacity-75' />
            Categories
          </a>
          <a href='/branches' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
            <GitBranch className='w-4 h-4 opacity-75' />
            Branches
          </a>
        </>
      )}
      */}

      {/* Super Admin: Audit Logs — hidden from UI
      {access.canViewAuditLogs && (
        <a href='/audit-logs' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
          <ShieldCheck className='w-4 h-4 opacity-75' />
          Audit Logs
        </a>
      )}
      */}

      {/* HR & Payroll module button (admin only) */}
      {access.canAccessHR && (
        <div className='pt-3 pb-1 border-t border-primary/10 mt-3 space-y-1'>
          <p className='px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-primary/45 mb-2'>
            Modules
          </p>
          <Link
            href="/hr/employees"
            onClick={() => setIsExpanded(true)}
            className={getLinkClasses('/hr/employees')}
          >
            <span className='flex items-center gap-3'>
              <Users className='w-4 h-4 opacity-75' />
              HR & Payroll
            </span>
          </Link>
        </div>
      )}
    </nav>
  );
}
