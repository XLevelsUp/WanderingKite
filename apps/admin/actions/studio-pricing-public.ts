'use server';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// ── Reads (public — no auth guard; see 00061_studio_packages.sql) ───────────

export async function getStudioPackages(includeInactive = false) {
  const supabase = await createClient();
  let query = supabase.from('studio_packages').select('*').order('sort_order', { ascending: true });
  if (!includeInactive) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) {
    logger.error('getStudioPackages failed:', error);
    return [];
  }
  return data ?? [];
}

export async function getStudioAddOns(includeInactive = false) {
  const supabase = await createClient();
  let query = supabase.from('studio_add_ons').select('*').order('sort_order', { ascending: true });
  if (!includeInactive) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) {
    logger.error('getStudioAddOns failed:', error);
    return [];
  }
  return data ?? [];
}
