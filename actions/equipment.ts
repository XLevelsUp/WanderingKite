'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { equipmentSchema } from '@/lib/validations/schemas';
import type { Database } from '@/lib/database.types';
import { redirect } from 'next/navigation';
import { parseSupabaseError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile.role)) {
    throw new Error('Unauthorized');
  }
  return { supabase, user };
}

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
    throw new Error(parseSupabaseError(error, 'Failed to fetch equipment.'));
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
      studioPricingPlans,
      image_url,
      description,
      deletedAt,
      category_name,
      categories(name),
      branches(name),
      is_studio_space,
      is_rental,
      categoryId,
      branchId,
      specs,
      purchase_date,
      warranty_duration_months,
      warranty_expiration_date,
      service_cost,
      repair_cost,
      purchase_bill,
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
    throw new Error(parseSupabaseError(error, 'Failed to fetch equipment status.'));
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
    throw new Error(parseSupabaseError(error, 'Failed to fetch equipment details.'));
  }

  return data;
}

// Create equipment
export async function createEquipment(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  let pricingPlansParsed: any[] = [];
  try {
    pricingPlansParsed = JSON.parse((formData.get('pricing_plans') as string) || '[]');
  } catch (err) { }

  let studioPricingPlansParsed: any[] = [];
  try {
    studioPricingPlansParsed = JSON.parse((formData.get('studio_pricing_plans') as string) || '[]');
  } catch (err) { }

  const rawData = {
    name: formData.get('name') as string,
    serialNumber: formData.get('serial_number') as string,
    categoryId: formData.get('category_id') as string,
    branchId: formData.get('branch_id') as string,
    imageUrl: (formData.get('image_url') as string) || '',
    specs: (formData.get('specs') as string) || null,
    description: (formData.get('description') as string) || null,
    pricingPlans: pricingPlansParsed,
    studioPricingPlans: studioPricingPlansParsed,
    purchaseBill: (formData.get('purchase_bill') as string) || '',
    purchaseDate: (formData.get('purchase_date') as string) || null,
    warrantyDurationMonths: formData.get('warranty_duration_months') ? parseInt(formData.get('warranty_duration_months') as string, 10) : null,
    warrantyExpirationDate: (formData.get('warranty_expiration_date') as string) || null,
    serviceCost: formData.get('service_cost') ? parseFloat(formData.get('service_cost') as string) : 0,
    repairCost: formData.get('repair_cost') ? parseFloat(formData.get('repair_cost') as string) : 0,
    isStudioSpace: formData.get('is_studio_space') === 'true',
    isRental: formData.get('is_rental') === 'true',
    categoryName: (formData.get('category_name') as string) || '',
  };

  // available_for_studio mirrors is_studio_space — the booking API reads this field
  const availableForStudio = rawData.isStudioSpace;

  const parsed = equipmentSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((e: any) => e.message).join(', ');
    throw new Error(`Validation Error: ${errorMsg}`);
  }
  const validatedData = parsed.data;

  // Sync flat rate columns for external rentals
  const hourlyRate = validatedData.pricingPlans?.find((p: any) => p.name.toLowerCase() === 'hourly')?.rate || 0.00;
  const dailyRate = validatedData.pricingPlans?.find((p: any) => p.name.toLowerCase() === 'daily')?.rate || 0.00;
  const weeklyRate = validatedData.pricingPlans?.find((p: any) => p.name.toLowerCase() === 'weekly')?.rate || 0.00;

  // Sync flat rate columns for studio space
  const studioHourlyRate = validatedData.studioPricingPlans?.find((p: any) => p.name.toLowerCase() === 'hourly')?.rate || 0.00;
  const studioDailyRate = validatedData.studioPricingPlans?.find((p: any) => p.name.toLowerCase() === 'daily')?.rate || 0.00;
  const studioWeeklyRate = validatedData.studioPricingPlans?.find((p: any) => p.name.toLowerCase() === 'weekly')?.rate || 0.00;

  const { data, error } = await supabase
    .from('equipment')
    .insert({
      name: validatedData.name,
      serialNumber: validatedData.serialNumber,
      categoryId: validatedData.categoryId || null,
      branchId: validatedData.branchId || null,
      pricingPlans: validatedData.pricingPlans,
      hourly_rate: hourlyRate,
      daily_rate: dailyRate,
      weekly_rate: weeklyRate,
      studioPricingPlans: validatedData.studioPricingPlans,
      studio_hourly_rate: studioHourlyRate,
      studio_daily_rate: studioDailyRate,
      studio_weekly_rate: studioWeeklyRate,
      image_url: validatedData.imageUrl || null,
      specs: validatedData.specs ? JSON.stringify(validatedData.specs.split(',').map((s: string) => s.trim()).filter(Boolean)) : '[]',
      description: validatedData.description,
      status: 'AVAILABLE',
      purchase_bill: validatedData.purchaseBill || null,
      purchase_date: validatedData.purchaseDate || null,
      warranty_duration_months: validatedData.warrantyDurationMonths || null,
      warranty_expiration_date: validatedData.warrantyExpirationDate || null,
      service_cost: validatedData.serviceCost || 0,
      repair_cost: validatedData.repairCost || 0,
      is_studio_space: validatedData.isStudioSpace,
      available_for_studio: availableForStudio,
      is_rental: validatedData.isRental,
      category_name: validatedData.categoryName || null,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to create equipment'));
  }

  // Log creation
  if (data?.id) {
    await supabase.from('equipment_history').insert({
      equipment_id: data.id,
      user_id: user.id,
      action: 'CREATED',
      changes: validatedData as any,
      notes: 'Initial creation'
    });
  }

  revalidatePath('/dashboard/equipment');
  revalidatePath('/rentals');
  return data;
}

// Update equipment
export async function updateEquipment(id: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();

  let pricingPlansParsed: any[] = [];
  try {
    pricingPlansParsed = JSON.parse((formData.get('pricing_plans') as string) || '[]');
  } catch (err) { }

  let studioPricingPlansParsed: any[] = [];
  try {
    studioPricingPlansParsed = JSON.parse((formData.get('studio_pricing_plans') as string) || '[]');
  } catch (err) { }

  const rawData = {
    name: formData.get('name') as string,
    serialNumber: formData.get('serial_number') as string,
    categoryId: formData.get('category_id') as string,
    branchId: formData.get('branch_id') as string,
    imageUrl: (formData.get('image_url') as string) || '',
    specs: (formData.get('specs') as string) || null,
    description: (formData.get('description') as string) || null,
    pricingPlans: pricingPlansParsed,
    studioPricingPlans: studioPricingPlansParsed,
    purchaseBill: (formData.get('purchase_bill') as string) || '',
    purchaseDate: (formData.get('purchase_date') as string) || null,
    warrantyDurationMonths: formData.get('warranty_duration_months') ? parseInt(formData.get('warranty_duration_months') as string, 10) : null,
    warrantyExpirationDate: (formData.get('warranty_expiration_date') as string) || null,
    serviceCost: formData.get('service_cost') ? parseFloat(formData.get('service_cost') as string) : 0,
    repairCost: formData.get('repair_cost') ? parseFloat(formData.get('repair_cost') as string) : 0,
    isStudioSpace: formData.get('is_studio_space') === 'true',
    isRental: formData.get('is_rental') === 'true',
    categoryName: (formData.get('category_name') as string) || '',
  };

  // available_for_studio mirrors is_studio_space — the booking API reads this field
  const availableForStudio = rawData.isStudioSpace;

  const parsed = equipmentSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((e: any) => e.message).join(', ');
    throw new Error(`Validation Error: ${errorMsg}`);
  }
  const validatedData = parsed.data;

  // Sync flat rate columns for external rentals
  const hourlyRate = validatedData.pricingPlans?.find((p: any) => p.name.toLowerCase() === 'hourly')?.rate || 0.00;
  const dailyRate = validatedData.pricingPlans?.find((p: any) => p.name.toLowerCase() === 'daily')?.rate || 0.00;
  const weeklyRate = validatedData.pricingPlans?.find((p: any) => p.name.toLowerCase() === 'weekly')?.rate || 0.00;

  // Sync flat rate columns for studio space
  const studioHourlyRate = validatedData.studioPricingPlans?.find((p: any) => p.name.toLowerCase() === 'hourly')?.rate || 0.00;
  const studioDailyRate = validatedData.studioPricingPlans?.find((p: any) => p.name.toLowerCase() === 'daily')?.rate || 0.00;
  const studioWeeklyRate = validatedData.studioPricingPlans?.find((p: any) => p.name.toLowerCase() === 'weekly')?.rate || 0.00;

  const { error } = await supabase
    .from('equipment')
    .update({
      name: validatedData.name,
      serialNumber: validatedData.serialNumber,
      categoryId: validatedData.categoryId || null,
      branchId: validatedData.branchId || null,
      pricingPlans: validatedData.pricingPlans,
      hourly_rate: hourlyRate,
      daily_rate: dailyRate,
      weekly_rate: weeklyRate,
      studioPricingPlans: validatedData.studioPricingPlans,
      studio_hourly_rate: studioHourlyRate,
      studio_daily_rate: studioDailyRate,
      studio_weekly_rate: studioWeeklyRate,
      image_url: validatedData.imageUrl || null,
      specs: validatedData.specs ? JSON.stringify(validatedData.specs.split(',').map((s: string) => s.trim()).filter(Boolean)) : '[]',
      description: validatedData.description,
      purchase_bill: validatedData.purchaseBill || null,
      purchase_date: validatedData.purchaseDate || null,
      warranty_duration_months: validatedData.warrantyDurationMonths || null,
      warranty_expiration_date: validatedData.warrantyExpirationDate || null,
      service_cost: validatedData.serviceCost || 0,
      repair_cost: validatedData.repairCost || 0,
      is_studio_space: validatedData.isStudioSpace,
      available_for_studio: availableForStudio,
      is_rental: validatedData.isRental,
      category_name: validatedData.categoryName || null,
    } as any)
    .eq('id', id);

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to update equipment'));
  }

  // Log update
  await supabase.from('equipment_history').insert({
    equipment_id: id,
    user_id: user.id,
    action: 'UPDATED',
    changes: validatedData as any,
    notes: 'Equipment details updated'
  });

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
  const { supabase } = await requireAdmin();

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
  const { supabase, user } = await requireAdmin();

  // Verify SUPER_ADMIN
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admin can delete equipment');
  }

  const { error } = await supabase
    .from('equipment')
    .update({ deletedAt: new Date().toISOString(), status: 'RETIRED' })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete equipment: ${error.message}`);
  }

  // Log deletion
  await supabase.from('equipment_history').insert({
    equipment_id: id,
    user_id: user.id,
    action: 'DELETED',
    changes: { deleted: true },
    notes: 'This equipment was deleted by Super Admin'
  });

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

// Get equipment audit logs
export async function getEquipmentAuditLog(equipmentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipment_history')
    .select(
      `
      id,
      action,
      notes,
      created_at,
      changes,
      user:profiles!equipment_history_user_id_fkey(id, fullName, email)
    `
    )
    .eq('equipment_id', equipmentId)
    .order('created_at', { ascending: false });

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
    throw new Error(parseSupabaseError(error, 'Failed to fetch categories.'));
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
    throw new Error(parseSupabaseError(error, 'Failed to fetch branches.'));
  }

  return data ?? [];
}

// Add maintenance record
export async function addMaintenanceRecord(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const equipmentId = formData.get('equipment_id') as string;
  const type = formData.get('maintenance_type') as string;
  const cost = Number(formData.get('cost'));
  const date = formData.get('date') as string;
  const notes = formData.get('notes') as string;

  const { error } = await supabase.from('equipment_maintenance_history').insert({
    equipment_id: equipmentId,
    maintenance_type: type,
    cost: cost,
    date: date,
    notes: notes,
    created_by: user.id
  });

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to add maintenance record.'));
  }

  revalidatePath(`/dashboard/equipment/${equipmentId}`);
  revalidatePath('/dashboard/equipment');
}

// Get maintenance records for equipment
export async function getMaintenanceRecords(equipmentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipment_maintenance_history')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('date', { ascending: false });

  if (error) {
    logger.error('Error fetching maintenance records for equipment:', equipmentId, error);
    return [];
  }

  return data ?? [];
}
