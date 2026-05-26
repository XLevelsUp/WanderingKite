import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Redirects to the unified HR onboarding page.
 * The old /dashboard/employees/new only created the auth profile (no contract).
 * All employee creation now happens through /admin/employees/new which handles
 * both profile creation and HR contract setup in a single flow.
 */
export default async function NewEmployeeRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Only admins can create employees; redirect to the unified HR onboarding page
  if (profile?.role === 'SUPER_ADMIN' || profile?.role === 'ADMIN') {
    redirect('/admin/employees/new');
  }

  // Non-admins get sent back to the employees list
  redirect('/dashboard/employees');
}
