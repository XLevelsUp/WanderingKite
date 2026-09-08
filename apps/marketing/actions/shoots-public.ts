'use server';

import { createClient } from '@/lib/supabase/server';

export async function getShootsBySubCategory(subCategory: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shoots')
    .select('*, gallery_images(*)')
    .eq('sub_category', subCategory)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }
  return data ?? [];
}
