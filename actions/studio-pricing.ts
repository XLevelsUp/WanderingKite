'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdminOrSuper } from '@/actions/rental-policy';
import { parseSupabaseError } from '@/lib/errorHandler';
import { studioPackageSchema, studioAddOnSchema } from '@/lib/validations/studio-pricing';
import { logger } from '@/lib/logger';

function revalidateStudioPricing() {
  revalidatePath('/studiospace');
  revalidatePath('/dashboard/studio-pricing');
}

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

// ── Packages CRUD (admin only) ───────────────────────────────────────────────

export async function createStudioPackage(input: unknown) {
  const parsed = studioPackageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid package data.' };
  }
  const { supabase } = await requireAdminOrSuper();
  const data = parsed.data;

  const { error } = await supabase.from('studio_packages').insert({
    name: data.name,
    price: data.price,
    original_price: data.originalPrice,
    duration_label: data.durationLabel,
    description: data.description,
    is_best_value: data.isBestValue,
    sort_order: data.sortOrder,
    is_active: data.isActive,
  });

  if (error) {
    return { error: parseSupabaseError(error, 'Failed to create package.') };
  }
  revalidateStudioPricing();
  return { success: true };
}

export async function updateStudioPackage(id: string, input: unknown) {
  const parsed = studioPackageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid package data.' };
  }
  const { supabase } = await requireAdminOrSuper();
  const data = parsed.data;

  const { error } = await supabase
    .from('studio_packages')
    .update({
      name: data.name,
      price: data.price,
      original_price: data.originalPrice,
      duration_label: data.durationLabel,
      description: data.description,
      is_best_value: data.isBestValue,
      sort_order: data.sortOrder,
      is_active: data.isActive,
    })
    .eq('id', id);

  if (error) {
    return { error: parseSupabaseError(error, 'Failed to update package.') };
  }
  revalidateStudioPricing();
  return { success: true };
}

export async function deleteStudioPackage(id: string) {
  const { supabase } = await requireAdminOrSuper();
  const { error } = await supabase.from('studio_packages').delete().eq('id', id);
  if (error) {
    return { error: parseSupabaseError(error, 'Failed to delete package.') };
  }
  revalidateStudioPricing();
  return { success: true };
}

// ── Add-ons CRUD (admin only) ────────────────────────────────────────────────

export async function createStudioAddOn(input: unknown) {
  const parsed = studioAddOnSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid add-on data.' };
  }
  const { supabase } = await requireAdminOrSuper();
  const data = parsed.data;

  const { error } = await supabase.from('studio_add_ons').insert({
    name: data.name,
    price: data.price,
    unit: data.unit,
    sort_order: data.sortOrder,
    is_active: data.isActive,
  });

  if (error) {
    return { error: parseSupabaseError(error, 'Failed to create add-on.') };
  }
  revalidateStudioPricing();
  return { success: true };
}

export async function updateStudioAddOn(id: string, input: unknown) {
  const parsed = studioAddOnSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid add-on data.' };
  }
  const { supabase } = await requireAdminOrSuper();
  const data = parsed.data;

  const { error } = await supabase
    .from('studio_add_ons')
    .update({
      name: data.name,
      price: data.price,
      unit: data.unit,
      sort_order: data.sortOrder,
      is_active: data.isActive,
    })
    .eq('id', id);

  if (error) {
    return { error: parseSupabaseError(error, 'Failed to update add-on.') };
  }
  revalidateStudioPricing();
  return { success: true };
}

export async function deleteStudioAddOn(id: string) {
  const { supabase } = await requireAdminOrSuper();
  const { error } = await supabase.from('studio_add_ons').delete().eq('id', id);
  if (error) {
    return { error: parseSupabaseError(error, 'Failed to delete add-on.') };
  }
  revalidateStudioPricing();
  return { success: true };
}
