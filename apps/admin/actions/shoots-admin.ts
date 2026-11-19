'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/database.types';

// The public portfolio (apps/marketing's /photography) lives in a separate
// deployment and can't be revalidated in-process from here — revalidatePath
// only affects the calling app's own cache. Marketing needs its own
// on-demand-revalidation trigger to pick up shoot changes before its ISR
// window naturally expires; tracked as an open item, not solved here.

type Tables = Database['public']['Tables'];
type ShootUpdate = Tables['shoots']['Update'];
export type PhotoCategory = Tables['photo_categories']['Row'] & { section_name: string; group_name: string };
export type PhotoCity = Tables['photo_cities']['Row'];

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

/** Sections → groups → categories and the city list, for the album form's pickers (from 00088_photography_catalog). */
export async function getPhotoCatalog(): Promise<{ categories: PhotoCategory[]; cities: PhotoCity[] }> {
  const supabase = await createClient();
  const [sections, groups, categories, cities] = await Promise.all([
    supabase.from('photo_sections').select('*').order('sort_order'),
    supabase.from('photo_groups').select('*').order('sort_order'),
    supabase.from('photo_categories').select('*').order('sort_order'),
    supabase.from('photo_cities').select('*').order('sort_order'),
  ]);
  const sectionName = new Map((sections.data ?? []).map((s) => [s.slug, s.name]));
  const sectionOrder = new Map((sections.data ?? []).map((s) => [s.slug, s.sort_order]));
  const groupInfo = new Map((groups.data ?? []).map((g) => [`${g.section_slug}/${g.slug}`, g]));

  const rows = (categories.data ?? []).map((c) => ({
    ...c,
    section_name: sectionName.get(c.section_slug) ?? c.section_slug,
    group_name: groupInfo.get(`${c.section_slug}/${c.group_slug}`)?.name ?? c.group_slug,
  }));
  // Order by section, then group, then category — the order the menus show.
  rows.sort(
    (a, b) =>
      (sectionOrder.get(a.section_slug) ?? 0) - (sectionOrder.get(b.section_slug) ?? 0) ||
      (groupInfo.get(`${a.section_slug}/${a.group_slug}`)?.sort_order ?? 0) - (groupInfo.get(`${b.section_slug}/${b.group_slug}`)?.sort_order ?? 0) ||
      a.sort_order - b.sort_order
  );
  return { categories: rows, cities: cities.data ?? [] };
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
    .order('sort_order', { referencedTable: 'gallery_images' })
    .single();

  if (error) {
    return null;
  }
  return data;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'album';

/** First free slug: base, base-2, base-3… (ignoring the album being edited). */
async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string, selfId?: string) {
  const { data } = await supabase.from('shoots').select('id, slug').like('slug', `${base}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== selfId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Reads the album form. Legacy category/sub_category are kept in sync (section / category slug) for anything still reading them. */
async function readShootForm(supabase: Awaited<ReturnType<typeof createClient>>, formData: FormData, selfId?: string): Promise<ShootUpdate & { title: string; category: string }> {
  const str = (k: string) => ((formData.get(k) as string | null) ?? '').trim();
  const title = str('title');
  if (!title) throw new Error('Title is required');

  const categoryId = str('category_id') || null;
  let sectionSlug = 'uncategorised';
  let categorySlug: string | null = null;
  if (categoryId) {
    const { data: cat } = await supabase.from('photo_categories').select('section_slug, slug').eq('id', categoryId).single();
    if (!cat) throw new Error('Unknown category');
    sectionSlug = cat.section_slug;
    categorySlug = cat.slug;
  }

  const status = str('status') === 'published' ? 'published' : 'draft';
  if (status === 'published' && !categoryId) throw new Error('Choose a category before publishing');

  const slug = await uniqueSlug(supabase, slugify(str('slug') || str('client_names') || title), selfId);

  return {
    title,
    category: sectionSlug,
    sub_category: categorySlug,
    category_id: categoryId,
    city_slug: str('city_slug') || null,
    client_names: str('client_names') || null,
    story: str('story') || null,
    description: str('description') || null,
    shoot_date: str('shoot_date') || null,
    featured: formData.get('featured') === 'on',
    status,
    slug,
  };
}

export async function createShoot(formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = await readShootForm(supabase, formData);

  const { data, error } = await supabase.from('shoots').insert(fields).select().single();
  if (error) throw new Error(`Failed to create shoot: ${error.message}`);

  revalidatePath('/portfolio');
  return data;
}

export async function updateShoot(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = await readShootForm(supabase, formData, id);

  const { error } = await supabase.from('shoots').update(fields).eq('id', id);
  if (error) throw new Error(`Failed to update shoot: ${error.message}`);

  revalidatePath('/portfolio');
  revalidatePath(`/portfolio/${id}`);
  return { success: true, slug: fields.slug };
}

export async function deleteShoot(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('shoots').delete().eq('id', id);

  if (error) throw new Error(`Failed to delete shoot: ${error.message}`);

  revalidatePath('/portfolio');
  return { success: true };
}

export async function addGalleryImage(shootId: string, url: string, altText?: string) {
  const { supabase } = await requireAdmin();

  // New images go to the end of the album.
  const { data: last } = await supabase
    .from('gallery_images')
    .select('sort_order')
    .eq('shoot_id', shootId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('gallery_images')
    .insert({ shoot_id: shootId, url, alt_text: altText || null, sort_order: (last?.sort_order ?? -1) + 1 })
    .select()
    .single();

  if (error) throw new Error(`Failed to add image: ${error.message}`);

  // First image becomes the cover if the album has none yet.
  await supabase.from('shoots').update({ cover_image_url: url }).eq('id', shootId).is('cover_image_url', null);

  revalidatePath(`/portfolio/${shootId}`);
  return data;
}

export async function deleteGalleryImage(id: string, shootId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);

  if (error) throw new Error(`Failed to delete image: ${error.message}`);

  revalidatePath(`/portfolio/${shootId}`);
  return { success: true };
}

export async function setShootCover(shootId: string, url: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('shoots').update({ cover_image_url: url }).eq('id', shootId);
  if (error) throw new Error(`Failed to set cover: ${error.message}`);
  revalidatePath(`/portfolio/${shootId}`);
  revalidatePath('/portfolio');
  return { success: true };
}

/** Moves one image a step earlier/later by renumbering the whole album 0..n (fixes any gaps or duplicate sort_order). */
export async function moveGalleryImage(shootId: string, imageId: string, direction: -1 | 1) {
  const { supabase } = await requireAdmin();
  const { data: images, error } = await supabase
    .from('gallery_images')
    .select('id, sort_order, created_at')
    .eq('shoot_id', shootId)
    .order('sort_order')
    .order('created_at');
  if (error || !images) throw new Error('Failed to load images');

  const ids = images.map((i) => i.id);
  const from = ids.indexOf(imageId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return { success: true };
  [ids[from], ids[to]] = [ids[to], ids[from]];

  const changed = ids.map((id, i) => ({ id, i })).filter(({ id, i }) => images.find((x) => x.id === id)?.sort_order !== i);
  const results = await Promise.all(changed.map(({ id, i }) => supabase.from('gallery_images').update({ sort_order: i }).eq('id', id)));
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(`Failed to reorder: ${failed.error.message}`);

  revalidatePath(`/portfolio/${shootId}`);
  return { success: true };
}
