import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasAccess } from '@/lib/access';
import { getStudioPackages, getStudioAddOns } from '@/actions/studio-pricing-public';
import { StudioPricingClient } from './StudioPricingClient';

export const metadata = {
  title: 'Studio Pricing — Studio ERP',
};

export default async function StudioPricingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/studio-pricing')) {
    redirect('/');
  }

  const [packages, addOns] = await Promise.all([
    getStudioPackages(true),
    getStudioAddOns(true),
  ]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Studio Pricing</h1>
        <p className="text-muted-foreground mt-2">
          Edit the session packages and add-ons shown on the Studio Space page and in the client booking flow.
        </p>
      </div>

      <StudioPricingClient initialPackages={packages} initialAddOns={addOns} />
    </div>
  );
}
