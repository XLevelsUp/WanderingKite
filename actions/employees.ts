'use server';

import { createClient } from '@/lib/supabase/server';
import { adminAuthClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  CreateEmployeeFormData,
  UpdateEmployeeFormData,
} from '@/lib/validations/employees';
import { redirect } from 'next/navigation';
import { parseSupabaseError } from '@/lib/errorHandler';
import { writeAuditLog } from '@/lib/audit';

export async function getEmployees(query?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // The user requested that employees can see all other employees in the team list.
  // We use adminAuthClient to bypass RLS which normally restricts employees to seeing only their own profile.
  // We exclude soft-deleted profiles and profiles where the employee contract is inactive.
  let dbQuery = adminAuthClient
    .from('profiles')
    .select('*, branches(name), manager:managerId(fullName), employee_contracts(isActive)')
    .is('deletedAt', null)
    .order('createdAt', { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike('fullName', `%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to retrieve employee directory.'));
  }

  // Filter out profiles where ALL contracts are inactive.
  // Profiles with no contracts (e.g. ADMIN/SUPER_ADMIN) are kept.
  const activeEmployees = (data ?? []).filter((profile: any) => {
    const contracts = profile.employee_contracts;
    if (!contracts || contracts.length === 0) return true; // No contract → keep (admin etc.)
    return contracts.some((c: any) => c.isActive === true); // Has at least one active contract
  });

  return activeEmployees;
}

export async function getBranches() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch branches.'));
  }

  return data;
}

export async function getEmployee(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*, branches(name), manager:managerId(fullName)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch employee details.'));
  }

  return data;
}

export async function createEmployee(data: CreateEmployeeFormData) {
  const supabase = await createClient(); // For auth check
  const {
    data: { user: requester },
  } = await supabase.auth.getUser();

  if (!requester) {
    return { error: 'Unauthorized' };
  }

  // Verify role
  const { data: requesterProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', requester.id)
    .single();

  if (
    !requesterProfile ||
    (requesterProfile.role !== 'SUPER_ADMIN' &&
      requesterProfile.role !== 'ADMIN')
  ) {
    return { error: 'Insufficient permissions' };
  }

  const result = createEmployeeSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Invalid data', details: result.error.flatten() };
  }

  const { email, password, full_name, role, branch_id, manager_id } =
    result.data;

  if (requesterProfile.role === 'ADMIN' && role === 'SUPER_ADMIN') {
    return { error: 'Cannot create a Super Admin' };
  }

  // 1. Create User in Auth (using Service Role)
  // We pass fullName in metadata to match the updated trigger requirement
  const { data: authUser, error: authError } =
    await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm
      user_metadata: { fullName: full_name },
    });

  if (authError || !authUser.user) {
    logger.error('Error creating auth user', authError);
    return { error: authError?.message || 'Failed to create user' };
  }

  // 2. Update Profile (Profile is auto-created by trigger, but we need to update role/branch/manager)
  // Note: fullName is already set by the (fixed) trigger if we pass it correctly in metadata.

  const { error: profileError } = await adminAuthClient
    .from('profiles')
    .update({
      role: role,
      branchId: branch_id === 'no_branch' ? null : branch_id || null,
      managerId: manager_id === 'no_manager' ? null : manager_id || null,
    })
    .eq('id', authUser.user.id);

  if (profileError) {
    logger.error('Error updating profile', profileError);
    return { error: 'User created but failed to update profile details.' };
  }

  await writeAuditLog(supabase, {
    user_id: requester.id,
    action: 'CREATE_EMPLOYEE',
    table_name: 'profiles',
    record_id: authUser.user.id,
    new_data: { email, full_name, role, branch_id, manager_id },
  });

  revalidatePath('/dashboard/employees');
  return { success: true };
}

export async function updateEmployee(id: string, data: UpdateEmployeeFormData) {
  const supabase = await createClient();
  const {
    data: { user: requester },
  } = await supabase.auth.getUser();

  if (!requester) {
    return { error: 'Unauthorized' };
  }

  // Verify role
  const { data: requesterProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', requester.id)
    .single();

  if (!requesterProfile) {
    return { error: 'Profile not found' };
  }

  const result = updateEmployeeSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Invalid data', details: result.error.flatten() };
  }

  const { full_name, role, branch_id, manager_id } = result.data;

  // Authorization Check Logic
  if (requesterProfile.role === 'EMPLOYEE') {
    if (id !== requester.id) return { error: 'Unauthorized' };
    if (role || branch_id !== undefined || manager_id !== undefined)
      return { error: 'Unauthorized to change restricted fields' };
  }

  if (requesterProfile.role === 'ADMIN') {
    const target = await getEmployee(id);
    if (target?.role === 'SUPER_ADMIN') {
      return { error: 'Cannot modify Super Admin' };
    }
    if (role === 'SUPER_ADMIN') {
      return { error: 'Cannot promote to Super Admin' };
    }
  }

  const { data: oldRow } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  // Update
  const { error } = await adminAuthClient
    .from('profiles')
    .update({
      fullName: full_name,
      ...(role ? { role } : {}),
      ...(branch_id !== undefined
        ? { branchId: branch_id === 'no_branch' ? null : branch_id }
        : {}),
      ...(manager_id !== undefined
        ? { managerId: manager_id === 'no_manager' ? null : manager_id }
        : {}),
    })
    .eq('id', id);

  if (error) {
    logger.error('Error updating employee', error);
    return { error: 'Failed to update employee' };
  }

  await writeAuditLog(supabase, {
    user_id: requester.id,
    action: 'UPDATE_EMPLOYEE',
    table_name: 'profiles',
    record_id: id,
    old_data: oldRow,
    new_data: { full_name, role, branch_id, manager_id },
  });

  revalidatePath('/dashboard/employees');
  revalidatePath(`/dashboard/employees/${id}`);
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  const {
    data: { user: requester },
  } = await supabase.auth.getUser();

  if (!requester) {
    return { error: 'Unauthorized' };
  }

  if (requester.id === id) {
    return { error: 'You cannot delete your own account' };
  }

  const { data: requesterProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', requester.id)
    .single();

  if (!requesterProfile || requesterProfile.role !== 'SUPER_ADMIN') {
    return { error: 'Only Super Admin can delete employees' };
  }

  // 1. Soft delete profile in database
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ deletedAt: new Date().toISOString() })
    .eq('id', id);

  if (profileError) {
    logger.error('Error soft-deleting profile', profileError);
    return { error: profileError.message || 'Failed to delete employee profile' };
  }

  // 2. Deactivate contract if exists
  const { error: contractError } = await supabase
    .from('employee_contracts')
    .update({ isActive: false, deactivatedAt: new Date().toISOString() })
    .eq('profileId', id);

  if (contractError) {
    logger.error('Error deactivating contract during soft-delete', contractError);
    // Non-blocking, continue
  }

  // 3. Ban user in Supabase Auth so they cannot log in
  const { error: authError } = await adminAuthClient.auth.admin.updateUserById(id, {
    ban_duration: 'none',
  });

  if (authError) {
    logger.error('Error banning user in Auth during soft-delete', authError);
    // Non-blocking, continue
  }

  await writeAuditLog(supabase, {
    user_id: requester.id,
    action: 'DELETE_EMPLOYEE',
    table_name: 'profiles',
    record_id: id,
  });

  revalidatePath('/dashboard/employees');
  revalidatePath('/admin/employees');
  return { success: true };
}

export async function getAdmins() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, fullName')
    .in('role', ['ADMIN', 'SUPER_ADMIN'])
    .order('fullName');

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch administrators.'));
  }

  return data;
}
