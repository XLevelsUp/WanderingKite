import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { hasAccess } from '@/lib/access';
import { getStudioBookingConflicts } from '@/actions/audit';
import { BookingConflictsClient } from '@/components/dashboard/BookingConflictsClient';

export const metadata: Metadata = {
  title: 'Booking Conflicts — Studio ERP',
  description: 'Review and resolve studio booking scheduling conflicts.',
};

export const dynamic = 'force-dynamic';

export default async function BookingConflictsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/booking-conflicts')) {
    redirect('/');
  }

  const studioConflicts = await getStudioBookingConflicts();

  return (
    <div className="relative space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
              <Building2 className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground/90 tracking-tight">
              Booking Conflicts
            </h1>
          </div>
          <p className="text-sm text-foreground/45 ml-11.5">
            Review overlapping studio booking attempts and approve or reject overrides.
          </p>
        </div>
      </div>

      <BookingConflictsClient studioConflicts={studioConflicts} />
    </div>
  );
}
