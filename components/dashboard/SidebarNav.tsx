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
  // /admin/bookings is a dashboard-level page, NOT an HR route
  const isHRRoute = (p: string | null) =>
    !!p && p.startsWith('/admin') && !p.startsWith('/admin/bookings');
  const [isExpanded, setIsExpanded] = useState(() => isHRRoute(pathname));
  const router = useRouter();

  useEffect(() => {
    setIsExpanded(isHRRoute(pathname));
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
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
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/attendance', label: 'Attendance', icon: Calendar },
    { href: '/admin/payroll', label: 'Payroll', icon: Wallet },
  ];

  if (isExpanded) {
    return (
      <nav className='space-y-1.5 animate-in fade-in duration-200'>
        <div className='mb-8'>
          <h1 className='text-xl font-bold text-gradient-brand'>HR & Payroll</h1>
        </div>
        <a
          href="/dashboard"
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
        href='/dashboard'
        className={getLinkClasses('/dashboard')}
      >
        <LayoutDashboard className='w-4 h-4 opacity-75' />
        Dashboard
      </Link>

      {/* Employee-visible: Own profile */}
      {access.canViewEmployees && (
        <Link
          href='/dashboard/employees'
          className={getLinkClasses('/dashboard/employees')}
        >
          <Users className='w-4 h-4 opacity-75' />
          Employees
        </Link>
      )}

      {/* Employee-visible: Personal HR */}
      {access.canViewOwnAttendance && (
        <Link
          href='/dashboard/attendance'
          className={getLinkClasses('/dashboard/attendance')}
        >
          <Calendar className='w-4 h-4 opacity-75' />
          My Attendance
        </Link>
      )}
      {access.canViewOwnPayslips && (
        <Link
          href='/dashboard/payslips'
          className={getLinkClasses('/dashboard/payslips')}
        >
          <Wallet className='w-4 h-4 opacity-75' />
          My Payslips
        </Link>
      )}

      {access.canViewAuditLogs && (
        <Link href='/dashboard/audit-logs' className={getLinkClasses('/dashboard/audit-logs')}>
          <ShieldAlert className='w-4 h-4 opacity-75' />
          Audit Logs
        </Link>
      )}

      {access.canViewBookingConflicts && (
        <Link href='/dashboard/booking-conflicts' className={getLinkClasses('/dashboard/booking-conflicts')}>
          <ShieldAlert className='w-4 h-4 opacity-75' />
          Booking Conflicts
        </Link>
      )}

      {/* Admin-only operational pages */}
      {profile?.role === 'SUPER_ADMIN' && (
        <Link href='/admin/bookings' className={getLinkClasses('/admin/bookings')}>
          <Calendar className='w-4 h-4 opacity-75' />
          Central Bookings
        </Link>
      )}
      {access.canViewPortfolio && (
        <Link href='/dashboard/portfolio' className={getLinkClasses('/dashboard/portfolio')}>
          <FolderKanban className='w-4 h-4 opacity-75' />
          Portfolio
        </Link>
      )}
      {access.canViewEquipment && (
        <Link href='/dashboard/equipment' className={getLinkClasses('/dashboard/equipment')}>
          <Briefcase className='w-4 h-4 opacity-75' />
          Equipment
        </Link>
      )}
      {access.canViewMediaTracker && (
        <Link href='/dashboard/media-tracker' className={getLinkClasses('/dashboard/media-tracker')}>
          <HardDrive className='w-4 h-4 opacity-75' />
          Media Tracker
        </Link>
      )}
      {access.canViewRentalSettings && (
        <Link href='/dashboard/rental-settings' className={getLinkClasses('/dashboard/rental-settings')}>
          <Wrench className='w-4 h-4 opacity-75' />
          Rental Settings
        </Link>
      )}
      {access.canViewClients && (
        <Link href='/dashboard/clients' className={getLinkClasses('/dashboard/clients')}>
          <Users className='w-4 h-4 opacity-75' />
          Clients
        </Link>
      )}
      {/* Rentals — hidden from UI
      {access.canViewRentals && (
        <a href='/dashboard/rentals' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
          <Wallet className='w-4 h-4 opacity-75' />
          Rentals
        </a>
      )}
      */}
      {access.canViewDeployments && (
        <Link href='/dashboard/fieldops' className={getLinkClasses('/dashboard/fieldops')}>
          <Activity className='w-4 h-4 opacity-75' />
          Field Ops
        </Link>
      )}

      {/* Admin extras: Categories, Branches — hidden from UI
      {access.canViewAdminExtras && (
        <>
          <a href='/dashboard/categories' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
            <Layers className='w-4 h-4 opacity-75' />
            Categories
          </a>
          <a href='/dashboard/branches' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
            <GitBranch className='w-4 h-4 opacity-75' />
            Branches
          </a>
        </>
      )}
      */}

      {/* Super Admin: Audit Logs — hidden from UI
      {access.canViewAuditLogs && (
        <a href='/dashboard/audit-logs' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
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
            href="/admin/employees"
            onClick={() => setIsExpanded(true)}
            className={getLinkClasses('/admin/employees')}
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
