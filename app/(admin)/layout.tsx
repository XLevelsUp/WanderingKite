import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';

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

  return (
    <div className='min-h-screen bg-[#0A0A0B] pt-20'>
      <div className='flex'>
        {/* Sidebar */}
        <aside className='w-64 bg-[rgba(17,17,22,0.98)] border-r border-primary/12 text-foreground fixed left-0 top-20 bottom-0 overflow-y-auto backdrop-blur-xl'>
          <div className='p-6'>
            {/* Section header */}
            <div className='mb-8'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-60 mb-1'>
                HR & Payroll
              </p>
              <h1 className='text-lg font-bold text-foreground'>
                Studio ERP
              </h1>
            </div>

            {/* Nav */}
            <nav className='space-y-1'>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
                >
                  <span className='text-base leading-none'>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Divider */}
            <div className='my-6 border-t border-primary/10' />

            {/* Back to main dashboard */}
            <a
              href='/dashboard'
              className='flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-all duration-150'
            >
              <span className='text-base leading-none'>←</span>
              Dashboard
            </a>
          </div>

          {/* Footer: current user */}
          <div className='absolute bottom-0 left-0 right-0 p-6 border-t border-primary/12 bg-[rgba(17,17,22,0.98)]'>
            <div className='flex items-center gap-3'>
              {/* Avatar initials */}
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
          </div>
        </aside>

        {/* Main content */}
        <main className='flex-1 ml-64 min-h-[calc(100vh-5rem)]'>
          {children}
        </main>
      </div>
    </div>
  );
}
