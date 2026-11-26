'use server';

import { createClient } from '@/lib/supabase/server';
import { parseSupabaseError } from '@/lib/errorHandler';
import { cleanEquipmentName } from '@/lib/equipment-name';

// Get all equipment — excludes soft-deleted rows
export async function getEquipment() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipment')
    .select('*, categories(name), branches(name)')
    .is('deletedAt', null)
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch equipment.'));
  }

  return (data ?? []).map((item) => ({
    ...item,
    name: typeof item.name === 'string' ? cleanEquipmentName(item.name) : item.name,
  }));
}
