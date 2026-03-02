'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { quickReturnSchema, assignmentSchema } from '@/lib/validations/schemas';
import type {
  ActiveAssignment,
  EmployeeDeploymentGroup,
} from '@/lib/types/deployments';

// ─────────────────────────────────────────────────────────────────────────────
// READ: Form data for Create Assignment modal
// ─────────────────────────────────────────────────────────────────────────────

/** Fetches all data needed to populate the Create Assignment form dropdowns. */
export async function getAssignmentFormData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [employeesRes, equipmentRes, clientsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, fullName, email, role')
      .is('deletedAt', null)
      .in('role', ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'])
      .order('fullName'),
    supabase
      .from('equipment')
      .select('id, name, serialNumber, categories(name)')
      .is('deletedAt', null)
      .eq('status', 'AVAILABLE')
      .order('name'),
    supabase
      .from('clients')
      .select('id, name, email, phone')
      .is('deletedAt', null)
      .order('name'),
  ]);

  return {
    employees: employeesRes.data ?? [],
    equipment: equipmentRes.data ?? [],
    clients: clientsRes.data ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ: Fetch Active Deployments (Triad View)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all active equipment assignments (returnedAt IS NULL) with full
 * three-way joins: employee (profiles), equipment (→ categories), client.
 *
 * RLS guarantees employees only see their own rows; admins see all.
 * Returns pre-grouped EmployeeDeploymentGroup[] ready for DeploymentMatrix.
 */
export async function getActiveDeployments(): Promise<
  EmployeeDeploymentGroup[]
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('equipment_assignments')
    .select(
      `
      id,
      status,
      location,
      notes,
      assignedAt:   "assignedAt",
      expectedReturn: "expectedReturn",
      returnedAt:   "returnedAt",
      employee:     "employeeId"(id, fullName, email, role),
      equipment:    "equipmentId"(id, name, serialNumber, status, categories(name)),
      client:       "clientId"(id, name, email, phone)
      `,
    )
    .is('returnedAt', null)
    .order('"assignedAt"', { ascending: false });

  if (error) {
    console.error('[getActiveDeployments] Query failed:', error.message);
    throw new Error('Failed to fetch active deployments');
  }

  const now = Date.now();

  // Enrich rows with isOverdue flag and group by employee
  const groupMap = new Map<string, EmployeeDeploymentGroup>();

  for (const row of data ?? []) {
    const assignment: ActiveAssignment = {
      ...(row as unknown as Omit<ActiveAssignment, 'isOverdue'>),
      isOverdue:
        row.expectedReturn != null &&
        new Date(row.expectedReturn as string).getTime() < now &&
        row.status === 'in_field',
    };

    const empId = (row.employee as unknown as { id: string }).id;

    if (!groupMap.has(empId)) {
      groupMap.set(empId, {
        employee: assignment.employee,
        assignments: [],
        totalItems: 0,
        hasOverdue: false,
      });
    }

    const group = groupMap.get(empId)!;
    group.assignments.push(assignment);
    group.totalItems++;
    if (assignment.isOverdue) group.hasOverdue = true;
  }

  // Sort groups: overdue groups float to top
  return Array.from(groupMap.values()).sort((a, b) =>
    a.hasOverdue === b.hasOverdue ? 0 : a.hasOverdue ? -1 : 1,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE: Quick Return Server Action
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Marks an assignment as returned by timestamping returnedAt = now()
 * and setting status = 'returned'. Zod-validates the input to prevent
 * orphaned or malformed updates.
 *
 * Enforced by RLS: only ADMIN | SUPER_ADMIN can UPDATE this table.
 */
export async function quickReturnAction(
  assignmentId: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = quickReturnSchema.safeParse({ assignmentId, notes });
  if (!parsed.success) {
    return { success: false, error: 'Invalid assignment ID' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  // Verify the assignment is still active before writing
  const { data: existing, error: fetchError } = await supabase
    .from('equipment_assignments')
    .select('id, returnedAt')
    .eq('id', parsed.data.assignmentId)
    .is('returnedAt', null)
    .maybeSingle();

  if (fetchError || !existing) {
    return {
      success: false,
      error: 'Assignment not found or already returned',
    };
  }

  const { error } = await supabase
    .from('equipment_assignments')
    .update({
      returnedAt: new Date().toISOString(),
      status: 'returned',
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', parsed.data.assignmentId);

  if (error) {
    console.error('[quickReturnAction] Update failed:', error.message);
    return { success: false, error: 'Failed to mark equipment as returned' };
  }

  revalidatePath('/dashboard/deployments');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE: Create Assignment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new active equipment assignment (Triad record).
 * Zod-validates all foreign key UUIDs to prevent orphaned records.
 * RLS enforces admin-only insert.
 */
export async function createAssignmentAction(
  rawData: unknown,
): Promise<{ success: boolean; error?: string }> {
  const parsed = assignmentSchema.safeParse(rawData);
  if (!parsed.success) {
    const msg =
      parsed.error.flatten().formErrors.join(', ') ||
      Object.values(parsed.error.flatten().fieldErrors).flat().join(', ');
    return { success: false, error: msg || 'Validation failed' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { equipmentId, employeeId, clientId, expectedReturn, location, notes } =
    parsed.data;

  const { error } = await supabase.from('equipment_assignments').insert({
    equipmentId,
    employeeId,
    clientId: clientId ?? null,
    expectedReturn: expectedReturn ?? null,
    location: location ?? null,
    notes: notes ?? null,
    assignedBy: user.id,
    status: 'in_field',
  });

  if (error) {
    // Unique constraint violation = gear already assigned
    if (error.code === '23505') {
      return {
        success: false,
        error: 'This equipment already has an active assignment',
      };
    }
    console.error('[createAssignmentAction] Insert failed:', error.message);
    return { success: false, error: 'Failed to create assignment' };
  }

  revalidatePath('/dashboard/deployments');
  return { success: true };
}
