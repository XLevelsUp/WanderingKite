'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/database.types';

type ShootRow = Database['public']['Tables']['shoots']['Row'];
type GalleryImageRow = Database['public']['Tables']['gallery_images']['Row'];

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN' && profile.role !== 'DEVELOPER')) {
    throw new Error('Insufficient permissions');
  }
  return { supabase, user };
}

export async function getShoots() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shoots')
    .select('*, gallery_images(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }
  return data ?? [];
}

export async function getShootById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shoots')
    .select('*, gallery_images(*)')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }
  return data;
}

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

export async function createShoot(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const sub_category = formData.get('sub_category') as string;
  const description = formData.get('description') as string;

  const { data, error } = await supabase
    .from('shoots')
    .insert({ title, category, sub_category: sub_category || null, description: description || null })
    .select()
    .single();

  if (error) throw new Error(`Failed to create shoot: ${error.message}`);
  
  revalidatePath('/dashboard/portfolio');
  revalidatePath('/photography');
  return data;
}

export async function updateShoot(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const sub_category = formData.get('sub_category') as string;
  const description = formData.get('description') as string;

  const { error } = await supabase
    .from('shoots')
    .update({ title, category, sub_category: sub_category || null, description: description || null })
    .eq('id', id);

  if (error) throw new Error(`Failed to update shoot: ${error.message}`);
  
  revalidatePath('/dashboard/portfolio');
  revalidatePath(`/dashboard/portfolio/${id}`);
  revalidatePath('/photography');
  return { success: true };
}

export async function deleteShoot(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('shoots').delete().eq('id', id);

  if (error) throw new Error(`Failed to delete shoot: ${error.message}`);
  
  revalidatePath('/dashboard/portfolio');
  revalidatePath('/photography');
  return { success: true };
}

export async function addGalleryImage(shootId: string, url: string, altText?: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from('gallery_images')
    .insert({ shoot_id: shootId, url, alt_text: altText || null })
    .select()
    .single();

  if (error) throw new Error(`Failed to add image: ${error.message}`);
  
  revalidatePath(`/dashboard/portfolio/${shootId}`);
  revalidatePath('/photography');
  return data;
}

export async function deleteGalleryImage(id: string, shootId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);

  if (error) throw new Error(`Failed to delete image: ${error.message}`);
  
  revalidatePath(`/dashboard/portfolio/${shootId}`);
  revalidatePath('/photography');
  return { success: true };
}
