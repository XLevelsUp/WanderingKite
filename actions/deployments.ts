'use server';

import { createClient } from '@/lib/supabase/server';
import { adminAuthClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { quickReturnSchema, assignmentSchema } from '@/lib/validations/schemas';
import type {
  ActiveAssignment,
  EmployeeDeploymentGroup,
} from '@/lib/types/deployments';
import { parseSupabaseError } from '@/lib/errorHandler';

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
      .select('id, fullName, email, role, employee_contracts(isActive)')
      .is('deletedAt', null)
      .in('role', ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'])
      .order('fullName'),
    supabase
      .from('equipment')
      .select('id, name, serialNumber, categories(name), category_name, is_studio_space, is_rental')
      .is('deletedAt', null)
      .eq('status', 'AVAILABLE')
      .order('name'),
    supabase
      .from('clients')
      .select('id, name, email, phone')
      .is('deletedAt', null)
      .order('name'),
  ]);

  if (employeesRes.error) {
    throw new Error(parseSupabaseError(employeesRes.error, 'Failed to fetch employees.'));
  }
  if (equipmentRes.error) {
    throw new Error(parseSupabaseError(equipmentRes.error, 'Failed to fetch equipment.'));
  }
  if (clientsRes.error) {
    throw new Error(parseSupabaseError(clientsRes.error, 'Failed to fetch clients.'));
  }

  const rawEmployees = employeesRes.data ?? [];
  const activeEmployees = rawEmployees.filter((profile: any) => {
    const contracts = profile.employee_contracts;
    if (!contracts || contracts.length === 0) return true;
    return contracts.some((c: any) => c.isActive === true);
  }).map((p: any) => ({
    id: p.id,
    fullName: p.fullName,
    email: p.email,
    role: p.role,
  }));

  return {
    employees: activeEmployees,
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
    return [];
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
  // Using adminAuthClient so employees can mark any equipment as returned (bypasses RLS)
  const { data: existing, error: fetchError } = await adminAuthClient
    .from('equipment_assignments')
    .select('id, returnedAt, employeeId')
    .eq('id', parsed.data.assignmentId)
    .is('returnedAt', null)
    .maybeSingle();

  if (fetchError || !existing) {
    return {
      success: false,
      error: 'Assignment not found or already returned',
    };
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isOwner = existing.employeeId === user.id;
  if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN' && !isOwner) {
    return { success: false, error: 'Unauthorized to return this equipment.' };
  }

  const { error } = await adminAuthClient
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

  revalidatePath('/dashboard/fieldops');
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

  const { equipmentIds, employeeId, clientId, expectedReturn, location, notes, assignedAt, serviceType } =
    parsed.data;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isSelfAssignment = employeeId === user.id;
  if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN' && !isSelfAssignment) {
    return { success: false, error: 'Unauthorized to create assignment for another user.' };
  }

  const safeStart = assignedAt || new Date().toISOString();
  const safeEnd = expectedReturn || '2099-01-01T00:00:00Z';

  // 1. Manually check for conflicts to log them (since trigger rollback kills the log)
  // We MUST use adminAuthClient here because regular users cannot see assignments belonging to other users due to RLS.
  const { data: conflicts } = await adminAuthClient
    .from('equipment_assignments')
    .select('id, equipmentId')
    .in('equipmentId', equipmentIds)
    .is('returnedAt', null)
    .lt('assignedAt', safeEnd)
    .or(`expectedReturn.gt.${safeStart},expectedReturn.is.null`);

  if (conflicts && conflicts.length > 0) {
    // Log the clashes manually
    const clashPayload = conflicts.map((c) => ({
      equipment_id: c.equipmentId,
      attempted_by: user.id,
      attempted_start: safeStart,
      attempted_end: expectedReturn || null,
      conflict_with_assignment_id: c.id,
    }));
    const { error: auditError } = await adminAuthClient.from('audit_clash_logs').insert(clashPayload);
    if (auditError) {
      console.error('[createAssignmentAction] Audit log insert failed:', auditError.message);
    }

    return {
      success: false,
      error: 'Conflict: One or more selected items are already assigned during these dates.',
    };
  }

  // Insert multiple rows for each selected equipment item
  const payload = equipmentIds.map((eqId) => ({
    equipmentId: eqId,
    employeeId,
    clientId: clientId || null,
    expectedReturn: expectedReturn || null,
    location: location || null,
    notes: notes || null,
    assignedAt: assignedAt || new Date().toISOString(),
    service_type: serviceType || null,
    assignedBy: user.id,
    status: 'in_field',
  }));

  const { error } = await adminAuthClient.from('equipment_assignments').insert(payload);

  if (error) {
    // Unique constraint or Trigger exception
    if (error.code === '23505' || error.message?.includes('EQUIPMENT_CLASH')) {
      return {
        success: false,
        error: 'This equipment is already booked for the selected dates. Please choose different dates or a different item.',
      };
    }
    console.error('[createAssignmentAction] Insert failed:', error.message);
    return { success: false, error: `Unable to create assignment. Please try again or contact your admin. (${error.code || 'UNKNOWN'})` };
  }

  revalidatePath('/dashboard/fieldops');
  return { success: true };
}
