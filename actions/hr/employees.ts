'use server';

import { createClient } from '@/lib/supabase/server';
import { adminAuthClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  hrOnboardingSchema,
  contractSchema,
  unifiedOnboardingSchema,
  personalDetailsSchema,
  type HROnboardingFormData,
  type ContractFormData,
  type UnifiedOnboardingFormData,
  type PersonalDetailsFormData,
} from '@/lib/validations/hr';
import type { HREmployee } from '@/lib/types/hr';

// ─────────────────────────────────────────────────────────────────────────────
// GUARDS
// ─────────────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    redirect('/dashboard');
  }

  return { supabase, userId: user.id, role: profile.role as string };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all profiles (employees) joined with their HR contract row.
 * Admins see everyone. Uses Supabase nested select to left-join contracts.
 */
export async function getHREmployees(query?: string): Promise<HREmployee[]> {
  const { supabase } = await requireAdmin();

  let dbQuery = supabase
    .from('profiles')
    .select(
      `
      id, email, fullName, role,
      dateOfBirth, phone, gender, bloodGroup, panNumber,
      branches(id, name),
      employee_contracts(
        id, profileId, jobTitle, employmentType, baseSalary,
        joiningDate, bankAccountName, bankAccountNumber, bankIFSC, upiId,
        avatarUrl, notes, isActive, deactivatedAt, createdAt, updatedAt,
        employeeNumber, department, pfEnrolled, pfContinued, ptExempt, tdsExempt, exemptionReason
      )
    `,
    )
    .is('deletedAt', null)
    .order('fullName');

  if (query) {
    dbQuery = dbQuery.ilike('fullName', `%${query}%`);
  }

  const { data, error } = await dbQuery;
  if (error) return [];

  return (data ?? []).map((row: any) => ({
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: row.role,
    branch: row.branches ?? null,
    contract: Array.isArray(row.employee_contracts)
      ? (row.employee_contracts[0] ?? null)
      : (row.employee_contracts ?? null),
    dateOfBirth: row.dateOfBirth ?? null,
    phone: row.phone ?? null,
    gender: row.gender ?? null,
    bloodGroup: row.bloodGroup ?? null,
    panNumber: row.panNumber ?? null,
  }));
}

/** Single employee — profile + contract */
export async function getHREmployee(profileId: string): Promise<HREmployee | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id, email, fullName, role,
      dateOfBirth, phone, gender, bloodGroup, panNumber,
      branches(id, name),
      employee_contracts(
        id, profileId, jobTitle, employmentType, baseSalary,
        joiningDate, bankAccountName, bankAccountNumber, bankIFSC, upiId,
        avatarUrl, notes, isActive, deactivatedAt, createdAt, updatedAt,
        employeeNumber, department, pfEnrolled, pfContinued, ptExempt, tdsExempt, exemptionReason
      )
    `,
    )
    .eq('id', profileId)
    .single();

  if (error || !data) return null;

  const row = data as any;
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: row.role,
    branch: row.branches ?? null,
    contract: Array.isArray(row.employee_contracts)
      ? (row.employee_contracts[0] ?? null)
      : (row.employee_contracts ?? null),
    dateOfBirth: row.dateOfBirth ?? null,
    phone: row.phone ?? null,
    gender: row.gender ?? null,
    bloodGroup: row.bloodGroup ?? null,
    panNumber: row.panNumber ?? null,
  };
}

/**
 * Returns all profiles that do NOT yet have an employee_contract row.
 * Used to populate the "Link existing profile" dropdown in onboarding.
 */
export async function getProfilesWithoutContract() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, fullName, role')
    .is('deletedAt', null)
    .order('fullName');

  if (error) return [];

  // Filter client-side: profiles with no contract row
  const { data: contractProfiles } = await supabase
    .from('employee_contracts')
    .select('profileId');

  const contractedIds = new Set(
    (contractProfiles ?? []).map((c: any) => c.profileId),
  );

  return (data ?? []).filter((p: any) => !contractedIds.has(p.id));
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an HR contract for an existing profile.
 * Links the `profileId` to a new `employee_contracts` row.
 */
export async function createHREmployee(formData: HROnboardingFormData) {
  const { supabase } = await requireAdmin();

  const result = hrOnboardingSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const { profileId, ...contractData } = result.data;

  // Check profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .single();

  if (!profile) {
    return { error: 'Employee profile not found' };
  }

  // Check no duplicate contract
  const { data: existing } = await supabase
    .from('employee_contracts')
    .select('id')
    .eq('profileId', profileId)
    .single();

  if (existing) {
    return { error: 'This employee already has an HR contract' };
  }

  const { error } = await supabase.from('employee_contracts').insert({
    profileId,
    jobTitle: contractData.jobTitle,
    employmentType: contractData.employmentType,
    baseSalary: contractData.baseSalary,
    joiningDate: contractData.joiningDate,
    bankAccountName: contractData.bankAccountName || null,
    bankAccountNumber: contractData.bankAccountNumber || null,
    bankIFSC: contractData.bankIFSC || null,
    upiId: contractData.upiId || null,
    avatarUrl: contractData.avatarUrl || null,
    notes: contractData.notes || null,
    incentive: contractData.incentive || 0,
    employeeNumber: contractData.employeeNumber || null,
    department: contractData.department || null,
    pfEnrolled: contractData.pfEnrolled || false,
    pfContinued: contractData.pfContinued || false,
    ptExempt: contractData.ptExempt || false,
    tdsExempt: contractData.tdsExempt || false,
    exemptionReason: contractData.exemptionReason || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/employees');
  revalidatePath('/dashboard/employees');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED CREATE + ONBOARD (single-step: profile + contract)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a brand-new auth user + profile, then immediately creates the HR
 * contract — all in one server action. This replaces the two-step flow of
 * creating the user first and then separately onboarding them.
 */
export async function createAndOnboardEmployee(formData: UnifiedOnboardingFormData) {
  await requireAdmin();

  const result = unifiedOnboardingSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const {
    fullName,
    email,
    password,
    dateOfBirth,
    phone,
    gender,
    bloodGroup,
    panNumber,
    role,
    branchId,
    managerId,
    jobTitle,
    employmentType,
    baseSalary,
    incentive,
    joiningDate,
    bankAccountName,
    bankAccountNumber,
    bankIFSC,
    upiId,
    avatarUrl,
    notes,
  } = result.data;

  // 1. Create the auth user (admin SDK auto-confirms email)
  const { data: authUser, error: authError } =
    await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { fullName },
    });

  if (authError || !authUser.user) {
    return { error: authError?.message || 'Failed to create user account' };
  }

  const newProfileId = authUser.user.id;

  // 2. Update the auto-created profile (role, branch, manager, personal details)
  const { error: profileError } = await adminAuthClient
    .from('profiles')
    .update({
      role,
      branchId: branchId && branchId !== 'no_branch' ? branchId : null,
      managerId: managerId && managerId !== 'no_manager' ? managerId : null,
      dateOfBirth: dateOfBirth || null,
      phone: phone || null,
      gender: gender || null,
      bloodGroup: bloodGroup || null,
      panNumber: panNumber ? panNumber.toUpperCase() : null,
    })
    .eq('id', newProfileId);

  if (profileError) {
    // Best-effort cleanup: delete the auth user so we don't leave orphans
    await adminAuthClient.auth.admin.deleteUser(newProfileId);
    return { error: 'User created but failed to set profile details. Please try again.' };
  }

  // 3. Create the HR contract
  const { error: contractError } = await adminAuthClient
    .from('employee_contracts')
    .insert({
      profileId: newProfileId,
      jobTitle,
      employmentType,
      baseSalary,
      joiningDate,
      bankAccountName: bankAccountName || null,
      bankAccountNumber: bankAccountNumber || null,
      bankIFSC: bankIFSC || null,
      upiId: upiId || null,
      avatarUrl: avatarUrl || null,
      notes: notes || null,
      incentive: incentive || 0,
      employeeNumber: formData.employeeNumber || null,
      department: formData.department || null,
      pfEnrolled: formData.pfEnrolled || false,
      pfContinued: formData.pfContinued || false,
      ptExempt: formData.ptExempt || false,
      tdsExempt: formData.tdsExempt || false,
      exemptionReason: formData.exemptionReason || null,
    });

  if (contractError) {
    // Cleanup: delete auth user (profile row will cascade)
    await adminAuthClient.auth.admin.deleteUser(newProfileId);
    return { error: 'User created but failed to create HR contract: ' + contractError.message };
  }

  revalidatePath('/admin/employees');
  revalidatePath('/dashboard/employees');
  return { success: true, profileId: newProfileId };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────────────────────

/** Update personal profile details (DOB, phone, gender, blood group, PAN) */
export async function updateProfileDetails(profileId: string, data: PersonalDetailsFormData) {
  const { supabase } = await requireAdmin();

  const result = personalDetailsSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      dateOfBirth: result.data.dateOfBirth || null,
      phone: result.data.phone || null,
      gender: result.data.gender || null,
      bloodGroup: result.data.bloodGroup || null,
      panNumber: result.data.panNumber ? result.data.panNumber.toUpperCase() : null,
    })
    .eq('id', profileId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/employees/${profileId}`);
  revalidatePath('/admin/employees');
  return { success: true };
}

/** Update an existing employee contract */
export async function updateContract(contractId: string, data: ContractFormData) {
  const { supabase } = await requireAdmin();


  const result = contractSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const { error } = await supabase
    .from('employee_contracts')
    .update({
      jobTitle: result.data.jobTitle,
      employmentType: result.data.employmentType,
      baseSalary: result.data.baseSalary,
      joiningDate: result.data.joiningDate,
      bankAccountName: result.data.bankAccountName || null,
      bankAccountNumber: result.data.bankAccountNumber || null,
      bankIFSC: result.data.bankIFSC || null,
      upiId: result.data.upiId || null,
      avatarUrl: result.data.avatarUrl || null,
      notes: result.data.notes || null,
      incentive: result.data.incentive || 0,
      employeeNumber: result.data.employeeNumber || null,
      department: result.data.department || null,
      pfEnrolled: result.data.pfEnrolled || false,
      pfContinued: result.data.pfContinued || false,
      ptExempt: result.data.ptExempt || false,
      tdsExempt: result.data.tdsExempt || false,
      exemptionReason: result.data.exemptionReason || null,
    })
    .eq('id', contractId);

  if (error) return { error: error.message };

  revalidatePath('/admin/employees');
  revalidatePath('/admin/payroll', 'layout');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEACTIVATE / REACTIVATE
// ─────────────────────────────────────────────────────────────────────────────

/** Soft-deactivate: sets isActive=false, does NOT delete the profile or contract */
export async function deactivateEmployee(profileId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('employee_contracts')
    .update({ isActive: false, deactivatedAt: new Date().toISOString() })
    .eq('profileId', profileId);

  if (error) return { error: error.message };

  revalidatePath('/admin/employees');
  revalidatePath('/dashboard/employees');
  return { success: true };
}

export async function reactivateEmployee(profileId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('employee_contracts')
    .update({ isActive: true, deactivatedAt: null })
    .eq('profileId', profileId);

  if (error) return { error: error.message };

  revalidatePath('/admin/employees');
  revalidatePath('/dashboard/employees');
  return { success: true };
}
