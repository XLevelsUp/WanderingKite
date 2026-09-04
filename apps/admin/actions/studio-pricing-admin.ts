'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdminOrSuper } from '@/actions/rental-policy';
import { parseSupabaseError } from '@/lib/errorHandler';
import { studioPackageSchema, studioAddOnSchema } from '@/lib/validations/studio-pricing';

function revalidateStudioPricing() {
  // Note: /studiospace is apps/marketing's public pricing page — a separate
  // deployment that can't be revalidated in-process from here. Marketing
  // needs its own on-demand-revalidation trigger for that; tracked as an
  // open item, not solved here.
  revalidatePath('/studio-pricing');
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
