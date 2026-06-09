import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RentalSettingsClient } from './RentalSettingsClient';
import { getGlobalRentalPolicySettings } from '@/actions/rental-policy';

export const metadata = {
  title: 'Rental Policy Settings — Studio ERP',
};

export default async function RentalSettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    redirect('/dashboard');
  }

  // Fetch initial data
  const [settings, { data: equipment }] = await Promise.all([
    getGlobalRentalPolicySettings(),
    supabase.from('equipment').select('*').is('deletedAt', null).order('name')
  ]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rental Policy Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage global rate logic, limits, and review pending equipment rate changes.
        </p>
      </div>
      
      <RentalSettingsClient 
        role={profile.role} 
        settings={settings} 
        equipment={equipment || []} 
        logs={[]} 
      />
    </div>
  );
}
