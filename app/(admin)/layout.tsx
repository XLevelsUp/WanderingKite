import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { ResponsiveSidebarWrapper } from '@/components/dashboard/ResponsiveSidebarWrapper';

export const metadata: Metadata = {
  title: 'HR Admin — Studio ERP',
  description: 'Employee management, attendance, and payroll.',
};

const navItems = [
  { href: '/admin/employees', label: 'Employees', icon: '👥' },
  { href: '/admin/attendance', label: 'Attendance', icon: '🗓️' },
  { href: '/admin/payroll', label: 'Payroll', icon: '💰' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, fullName, email')
    .eq('id', user.id)
    .single();

  // HR section is ADMIN / SUPER_ADMIN only
  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const navContent = (
    <>
      <div className='mb-8'>
        <Image src="/wkfulllogo.png" alt="Wandering Kite Logo" width={160} height={40} className="mb-6 object-contain" />
        <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-60 mb-1'>
          HR & Payroll
        </p>
        <h1 className='text-lg font-bold text-foreground'>
          Studio ERP
        </h1>
      </div>

      <nav className='space-y-1'>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
          >
            <span className='text-base leading-none'>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className='my-6 border-t border-primary/10' />

      <Link
        href='/dashboard'
        className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-all duration-150'
      >
        <span className='text-base leading-none'>←</span>
        Dashboard
      </Link>
    </>
  );

  const footerContent = (
    <>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0'>
          {(profile.fullName ?? profile.email ?? 'U')
            .split(' ')
            .slice(0, 2)
            .map((n: string) => n[0]?.toUpperCase() ?? '')
            .join('')}
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-foreground truncate'>
            {profile.fullName ?? profile.email}
          </p>
          <p className='text-[10px] text-primary/60 uppercase tracking-widest'>
            {profile.role.replace('_', ' ')}
          </p>
        </div>
      </div>
      <div className='mt-4 flex justify-end'>
        <SignOutButton />
      </div>
    </>
  );

  return (
    <div className='min-h-screen bg-[#0A0A0B] pt-20'>
      <ResponsiveSidebarWrapper
        navContent={navContent}
        footerContent={footerContent}
      >
        {children}
      </ResponsiveSidebarWrapper>
    </div>
  );
}
