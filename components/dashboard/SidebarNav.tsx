'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

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
        <button
          onClick={() => setIsExpanded(false)}
          className='w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 hover:bg-primary/18 transition-all duration-150 group'
        >
          <ArrowLeftCircle className='w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform' />
          Return to Main Menu
        </button>

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
                className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/70 hover:text-primary hover:bg-primary/8 transition-all duration-150'
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
      <h1 className='text-xl font-bold mb-8 text-gradient-brand'>Main Menu</h1>
      {/* Always visible: Overview */}
      <Link
        href='/dashboard'
        className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
      >
        <LayoutDashboard className='w-4 h-4 opacity-75' />
        Dashboard
      </Link>

      {/* Employee-visible: Own profile */}
      {access.canViewEmployees && (
        <Link
          href='/dashboard/employees'
          className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
        >
          <Users className='w-4 h-4 opacity-75' />
          Employees
        </Link>
      )}

      {/* Employee-visible: Personal HR */}
      {access.canViewOwnAttendance && (
        <Link
          href='/dashboard/attendance'
          className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
        >
          <Calendar className='w-4 h-4 opacity-75' />
          My Attendance
        </Link>
      )}
      {access.canViewOwnPayslips && (
        <Link
          href='/dashboard/payslips'
          className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
        >
          <Wallet className='w-4 h-4 opacity-75' />
          My Payslips
        </Link>
      )}

      {access.canViewAuditLogs && (
        <Link href='/dashboard/audit-logs' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
          <ShieldAlert className='w-4 h-4 opacity-75' />
          Audit Logs
        </Link>
      )}

      {/* Admin-only operational pages */}
      {access.canViewPortfolio && (
        <Link href='/dashboard/portfolio' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
          <FolderKanban className='w-4 h-4 opacity-75' />
          Portfolio
        </Link>
      )}
      {access.canViewEquipment && (
        <Link href='/dashboard/equipment' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
          <Briefcase className='w-4 h-4 opacity-75' />
          Equipment
        </Link>
      )}
      {access.canViewRentalSettings && (
        <Link href='/dashboard/rental-settings' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
          <Wrench className='w-4 h-4 opacity-75' />
          Rental Settings
        </Link>
      )}
      {access.canViewClients && (
        <Link href='/dashboard/clients' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
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
        <Link href='/dashboard/fieldops' className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'>
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
            className='w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
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
