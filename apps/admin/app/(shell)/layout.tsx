import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { ResponsiveSidebarWrapper } from '@/components/dashboard/ResponsiveSidebarWrapper';
import { DueRemindersBanner } from '@/components/dashboard/DueRemindersBanner';
import { SessionTracker } from '@/components/dashboard/SessionTracker';
import { ClickTracker } from '@/components/dashboard/ClickTracker';
import { getMyReminders } from '@/actions/reminders';
import { isUnacknowledgedToday } from '@/lib/reminders';

export const metadata: Metadata = {
  title: 'Dashboard - Main Menu',
  description: 'Photo Studio ERP — Overview and operational modules.',
};

export default async function ShellLayout({
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

  // Due reminders — fetched here so the banner persists across all routes
  const isEmployee = profile?.role === 'EMPLOYEE';
  const allReminders = isEmployee ? [] : await getMyReminders();
  const dueReminders = allReminders.filter((r) => isUnacknowledgedToday(r));

  return (
    <div className="min-h-screen bg-[#0A0A0B] pt-20">
      {profile?.role !== 'DEVELOPER' && (
        <>
          <SessionTracker />
          <ClickTracker />
        </>
      )}

      {/* Non-blocking top-centre banner — persists across navigation */}
      <DueRemindersBanner reminders={dueReminders} />

      <ResponsiveSidebarWrapper
        navContent={
          <SidebarNav profile={profile} email={user.email || ''} />
        }
        footerContent={
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="text-sm text-foreground/50 min-w-0 flex-1">
              <Link
                href={`/employees/${user.id}`}
                className="font-medium text-foreground hover:text-primary truncate block transition-colors duration-150"
              >
                {user.email}
              </Link>
              <p className="text-xs mt-1 capitalize text-primary/55">
                {profile?.role.replace('_', ' ').toLowerCase()}
              </p>
            </div>
            <div className="flex-shrink-0">
              <SignOutButton />
            </div>
          </div>
        }
      >
        {children}
      </ResponsiveSidebarWrapper>
    </div>
  );
}
