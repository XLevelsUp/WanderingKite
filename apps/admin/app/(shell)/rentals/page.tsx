import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { hasAccess } from '@/lib/access';

export default async function RentalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/rentals')) {
    redirect('/');
  }
  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Rentals</h2>

      </div>
      <div>
        <p>Rental management list will appear here.</p>
        <p className="text-sm text-slate-500">Implementation pending.</p>
      </div>
    </div>
  );
}
