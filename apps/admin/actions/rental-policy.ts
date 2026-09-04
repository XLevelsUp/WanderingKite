'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';

export async function requireAdminOrSuper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile.role)) {
    redirect('/');
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
    logger.error('Error fetching settings', error);
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
    default_late_penalty_amount: Number(formData.get('default_late_penalty_amount')),
    active_billing_policy: formData.get('active_billing_policy') as string || 'HOURLY',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('rental_policy_settings')
    .update(updates)
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update whatever exists

  if (error) {
    throw new Error('Failed to update settings: ' + error.message);
  }
  revalidatePath('/rental-settings');
}

export async function updateEquipmentRate(equipmentId: string, formData: FormData) {
  const { supabase, user } = await requireAdminOrSuper();

  // Parse new rates
  const newHourly = Number(formData.get('hourly_rate'));
  const newDaily = Number(formData.get('daily_rate'));
  const newWeekly = Number(formData.get('weekly_rate'));
  const newDeposit = Number(formData.get('security_deposit'));
  const newPenalty = Number(formData.get('late_penalty_amount'));
  const newMinDuration = Number(formData.get('min_rental_duration_hours'));
  const newCondition = formData.get('condition') as string;

  // Get current rates
  const { data: currentItem } = await supabase.from('equipment').select('*').eq('id', equipmentId).single();
  if (!currentItem) throw new Error('Equipment not found');

  const updatedPricingPlans = [
    { name: 'Hourly', durationHours: 1, rate: newHourly },
    { name: 'Daily', durationHours: 8, rate: newDaily },
    { name: 'Weekly', durationHours: 56, rate: newWeekly }
  ];

  const newRatesJson = {
    hourly_rate: newHourly,
    daily_rate: newDaily,
    weekly_rate: newWeekly,
    pricingPlans: updatedPricingPlans,
    security_deposit: newDeposit,
    late_penalty_amount: newPenalty,
    min_rental_duration_hours: newMinDuration,
    condition: newCondition
  };

  const changes: Record<string, { old: any; new: any }> = {};
  let conditionNote = '';
  
  if (currentItem.condition !== newCondition) {
    changes.condition = { old: currentItem.condition, new: newCondition };
    conditionNote = `Condition updated from ${currentItem.condition || 'none'} to ${newCondition}. `;
  }
  if (Number(currentItem.hourly_rate) !== newHourly) changes.hourly_rate = { old: currentItem.hourly_rate, new: newHourly };
  if (Number(currentItem.daily_rate) !== newDaily) changes.daily_rate = { old: currentItem.daily_rate, new: newDaily };
  if (Number(currentItem.weekly_rate) !== newWeekly) changes.weekly_rate = { old: currentItem.weekly_rate, new: newWeekly };
  if (Number(currentItem.security_deposit) !== newDeposit) changes.security_deposit = { old: currentItem.security_deposit, new: newDeposit };
  if (Number(currentItem.late_penalty_amount) !== newPenalty) changes.late_penalty_amount = { old: currentItem.late_penalty_amount, new: newPenalty };
  if (Number(currentItem.min_rental_duration_hours) !== newMinDuration) changes.min_rental_duration_hours = { old: currentItem.min_rental_duration_hours, new: newMinDuration };

  const { error: updateError } = await supabase.from('equipment').update(newRatesJson as any).eq('id', equipmentId);
  if (updateError) {
    throw new Error('Failed to update equipment rates: ' + updateError.message);
  }

  if (Object.keys(changes).length > 0) {
    const notes = conditionNote ? conditionNote.trim() : 'Equipment rates/settings updated via Rental Settings.';
    const { error: historyError } = await supabase.from('equipment_history').insert({
      equipment_id: equipmentId,
      user_id: user.id,
      action: 'UPDATED',
      changes,
      notes
    });
    if (historyError) {
      logger.error('Failed to log equipment history:', historyError);
    }
  }

  revalidatePath('/rental-settings');
  revalidatePath('/equipment');
  revalidatePath(`/equipment/${equipmentId}`);
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
