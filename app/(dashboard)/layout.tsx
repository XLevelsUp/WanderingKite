import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - Rental Management',
  description: 'Manage your photo studio rental operations',
};

export default async function DashboardLayout({
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

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className='min-h-screen bg-[#0A0A0B] pt-20'>
      <div className='flex'>
        {/* Sidebar */}
        <aside className='w-64 bg-[rgba(17,17,22,0.98)] border-r border-primary/12 text-white fixed left-0 top-20 bottom-0 overflow-y-auto backdrop-blur-xl'>
          <div className='p-6'>
            <h1 className='text-xl font-bold mb-8 text-gradient-gold'>
              Rental System
            </h1>
            <nav className='space-y-1'>
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/dashboard/equipment', label: 'Equipment' },
                { href: '/dashboard/clients', label: 'Clients' },
                { href: '/dashboard/rentals', label: 'Rentals' },
                { href: '/dashboard/employees', label: 'Employees' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className='block px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
                >
                  {item.label}
                </a>
              ))}
              {(profile?.role === 'ADMIN' ||
                profile?.role === 'SUPER_ADMIN') && (
                <>
                  <a
                    href='/dashboard/deployments'
                    className='block px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
                  >
                    Field Ops
                  </a>
                  <a
                    href='/dashboard/categories'
                    className='block px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
                  >
                    Categories
                  </a>
                  <a
                    href='/dashboard/branches'
                    className='block px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
                  >
                    Branches
                  </a>
                </>
              )}
              {profile?.role === 'SUPER_ADMIN' && (
                <a
                  href='/dashboard/audit-logs'
                  className='block px-4 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-primary hover:bg-primary/8 transition-all duration-150'
                >
                  Audit Logs
                </a>
              )}
            </nav>
          </div>
          <div className='absolute bottom-0 left-0 right-0 p-6 border-t border-primary/12 bg-[rgba(17,17,22,0.98)]'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-foreground/50'>
                <Link
                  href={`/dashboard/employees/${user.id}`}
                  className='font-medium text-white hover:text-primary truncate block transition-colors duration-150'
                >
                  {profile?.full_name || user.email}
                </Link>
                <p className='text-xs mt-1 capitalize text-primary/55'>
                  {profile?.role.replace('_', ' ').toLowerCase()}
                </p>
              </div>
              <form action='/auth/signout' method='post'>
                <button
                  className='text-primary/50 hover:text-primary transition-colors'
                  title='Sign Out'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-log-out'
                  >
                    <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                    <polyline points='16 17 21 12 16 7' />
                    <line x1='21' x2='9' y1='12' y2='12' />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className='ml-64 flex-1 p-8 min-h-screen bg-[#0A0A0B]'>
          {children}
        </main>
      </div>
    </div>
  );
}
