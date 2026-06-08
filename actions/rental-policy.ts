'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function requireAdminOrSuper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    throw new Error('Unauthorized');
  }
  return { supabase, user, role: profile.role };
}

export async function getGlobalRentalPolicySettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rental_policy_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings', error);
    return null;
  }
  return data;
}

export async function updateGlobalRentalPolicySettings(formData: FormData) {
  const { supabase, role } = await requireAdminOrSuper();
  if (role !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admin can update global policies.');
  }

  const updates = {
    repeat_client_discount_percentage: Number(formData.get('repeat_client_discount_percentage')),
    default_security_deposit: Number(formData.get('default_security_deposit')),
    default_late_penalty_rate: Number(formData.get('default_late_penalty_rate')),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('rental_policy_settings')
    .update(updates)
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update whatever exists

  if (error) {
    throw new Error('Failed to update settings: ' + error.message);
  }
  revalidatePath('/admin/rental-settings');
}

export async function updateEquipmentRate(equipmentId: string, formData: FormData) {
  const { supabase, user } = await requireAdminOrSuper();

  // Parse new rates
  const newHourly = Number(formData.get('hourly_rate'));
  const newDaily = Number(formData.get('daily_rate'));
  const newWeekly = Number(formData.get('weekly_rate'));
  const newDeposit = Number(formData.get('security_deposit'));
  const newPenalty = Number(formData.get('late_penalty_rate'));
  const newMinDuration = Number(formData.get('min_rental_duration_hours'));
  const newCondition = formData.get('condition') as string;

  // Get current rates
  const { data: currentItem } = await supabase.from('equipment').select('*').eq('id', equipmentId).single();
  if (!currentItem) throw new Error('Equipment not found');

  const newRatesJson = {
    hourly_rate: newHourly,
    daily_rate: newDaily,
    weekly_rate: newWeekly,
    security_deposit: newDeposit,
    late_penalty_rate: newPenalty,
    min_rental_duration_hours: newMinDuration,
    condition: newCondition
  };

  await supabase.from('equipment').update(newRatesJson).eq('id', equipmentId);

  revalidatePath('/admin/rental-settings');
}



export async function getClientCustomContracts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('client_custom_contracts')
    .select(`
      *,
      client:client_id(name, email),
      equipment:equipment_id(name, serial_number)
    `)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}
