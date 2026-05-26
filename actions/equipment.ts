'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { equipmentSchema } from '@/lib/validations/schemas';
import type { Database } from '@/lib/database.types';

type Equipment = Database['public']['Tables']['equipment']['Row'];

// Get all equipment — excludes soft-deleted rows
export async function getEquipment() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipment')
    .select('*, categories(name), branches(name)')
    .is('deletedAt', null)
    .order('createdAt', { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

/**
 * Enriched equipment list for the listing page.
 * Left-joins the active equipment_assignment (returnedAt IS NULL) to surface
 * live field status: who holds the gear + for which client.
 *
 * Uses a nested PostgREST select — the inner filter `returnedAt.is.null` is
 * applied on the join side so we never pull historical assignments.
 */
export async function getEquipmentWithFieldStatus() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipment')
    .select(
      `
      id,
      name,
      serialNumber,
      status,
      pricingPlans,
      image_url,
      description,
      deletedAt,
      categories(name),
      branches(name),
      activeAssignment:equipment_assignments!equipmentId(
        id,
        status,
        assignedAt,
        expectedReturn,
        location,
        employee:"employeeId"(id, fullName, email),
        client:"clientId"(id, name, phone)
      )
      `,
    )
    .is('deletedAt', null)
    .order('createdAt', { ascending: false });

  if (error) {
    return [];
  }

  // PostgREST returns the join as an array — flatten to single active assignment
  return (data ?? []).map((item) => {
    type AssignmentRow = {
      id: string;
      status: string;
      assignedAt: string;
      expectedReturn: string | null;
      location: string | null;
      employee: { id: string; fullName: string | null; email: string } | null;
      client: { id: string; name: string; phone: string | null } | null;
    };
    const assignments =
      (item.activeAssignment as unknown as AssignmentRow[]) ?? [];
    const active =
      assignments.find(
        (a) => a.status === 'in_field' || a.status === 'maintenance',
      ) ?? null;
    return { ...item, activeAssignment: active };
  });
}

// Get equipment by ID
export async function getEquipmentById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipment')
    .select('*, categories(name), branches(name)')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// Create equipment
export async function createEquipment(formData: FormData) {
  const supabase = await createClient();

  let pricingPlansParsed: any[] = [];
  try {
    pricingPlansParsed = JSON.parse((formData.get('pricing_plans') as string) || '[]');
  } catch (err) {}

  const rawData = {
    name: formData.get('name') as string,
    serialNumber: formData.get('serial_number') as string,
    categoryId: formData.get('category_id') as string,
    branchId: formData.get('branch_id') as string,
    imageUrl: (formData.get('image_url') as string) || '',
    specs: (formData.get('specs') as string) || null,
    description: (formData.get('description') as string) || null,
    pricingPlans: pricingPlansParsed,
  };

  const validatedData = equipmentSchema.parse(rawData);

  const { data, error } = await supabase
    .from('equipment')
    .insert({
      name: validatedData.name,
      serialNumber: validatedData.serialNumber,
      categoryId: validatedData.categoryId || null,
      branchId: validatedData.branchId || null,
      pricingPlans: validatedData.pricingPlans,
      image_url: validatedData.imageUrl || null,
      specs: validatedData.specs ? JSON.stringify(validatedData.specs.split(',').map((s: string) => s.trim()).filter(Boolean)) : '[]',
      description: validatedData.description,
      status: 'AVAILABLE',
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create equipment: ${error.message}`);
  }
  revalidatePath('/dashboard/equipment');
  revalidatePath('/rentals');
  return data;
}

// Update equipment
export async function updateEquipment(id: string, formData: FormData) {
  const supabase = await createClient();

  let pricingPlansParsed: any[] = [];
  try {
    pricingPlansParsed = JSON.parse((formData.get('pricing_plans') as string) || '[]');
  } catch (err) {}

  const rawData = {
    name: formData.get('name') as string,
    serialNumber: formData.get('serial_number') as string,
    categoryId: formData.get('category_id') as string,
    branchId: formData.get('branch_id') as string,
    imageUrl: (formData.get('image_url') as string) || '',
    specs: (formData.get('specs') as string) || null,
    description: (formData.get('description') as string) || null,
    pricingPlans: pricingPlansParsed,
  };

  const validatedData = equipmentSchema.parse(rawData);

  const { error } = await supabase
    .from('equipment')
    .update({
      name: validatedData.name,
      serialNumber: validatedData.serialNumber,
      categoryId: validatedData.categoryId || null,
      branchId: validatedData.branchId || null,
      pricingPlans: validatedData.pricingPlans,
      image_url: validatedData.imageUrl || null,
      specs: validatedData.specs ? JSON.stringify(validatedData.specs.split(',').map((s: string) => s.trim()).filter(Boolean)) : '[]',
      description: validatedData.description,
    } as any)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update equipment: ${error.message}`);
  }
  revalidatePath('/dashboard/equipment');
  revalidatePath(`/dashboard/equipment/${id}`);
  revalidatePath('/rentals');
  return { id };
}

// Update equipment status
export async function updateEquipmentStatus(
  id: string,
  status:
    | 'AVAILABLE'
    | 'IN_USE'
    | 'MAINTENANCE'
    | 'RETIRED'
    | 'LOST'
    | 'RENTED',
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipment')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update equipment status: ${error.message}`);
  }
  revalidatePath('/dashboard/equipment');
  revalidatePath(`/dashboard/equipment/${id}`);
  revalidatePath('/rentals');
  return data;
}

// Soft-delete equipment — sets deletedAt, does NOT remove the row
export async function deleteEquipment(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('equipment')
    .update({ deletedAt: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete equipment: ${error.message}`);
  }
  revalidatePath('/dashboard/equipment');
  revalidatePath('/rentals');
}

// Chain of custody: get all assignment history for a piece of equipment
export async function getEquipmentAssignmentHistory(equipmentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('assignment_history')
    .select(
      `
      id,
      assignedAt,
      returnedAt,
      location,
      notes,
      orderId,
      assignedTo:profiles!assignment_history_assignedTo_fkey(id, fullName, email),
      assignedBy:profiles!assignment_history_assignedBy_fkey(id, fullName)
    `,
    )
    .eq('equipmentId', equipmentId)
    .order('assignedAt', { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

// Get all categories (for dropdowns)
export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    return [];
  }

  return data ?? [];
}

// Get all branches (for dropdowns)
export async function getBranches() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('name');

  if (error) {
    return [];
  }

  return data ?? [];
}
