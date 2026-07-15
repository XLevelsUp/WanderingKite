'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { clientSchema } from '@/lib/validations/schemas';
import { parseSupabaseError } from '@/lib/errorHandler';
import { writeAuditLog } from '@/lib/audit';

// Get all clients — excludes soft-deleted rows
export async function getClients() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*, client_services(type)')
    .is('deleted_at', null)         // hide soft-deleted clients
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch client lists.'));
  }

  return data ?? [];
}

// Create client
export async function createNewClient(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    govtId: (formData.get('govt_id') as string) || undefined,
  };

  // Validate
  const validatedData = clientSchema.parse(rawData);

  const { data, error } = await supabase
    .from('clients')
    .insert(validatedData)
    .select()
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to create client'));
  }

  if (user) {
    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'CREATE_CLIENT',
      table_name: 'clients',
      record_id: data.id,
      new_data: data,
    });
  }

  revalidatePath('/dashboard/clients');
  return data;
}

// Update client
export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: oldRow } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    govtId: (formData.get('govt_id') as string) || undefined,
  };

  // Validate
  const validatedData = clientSchema.parse(rawData);

  const { data, error } = await supabase
    .from('clients')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to update client'));
  }

  if (user) {
    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'UPDATE_CLIENT',
      table_name: 'clients',
      record_id: id,
      old_data: oldRow,
      new_data: data,
    });
  }

  revalidatePath('/dashboard/clients');
  return data;
}

// Soft-delete client — sets deleted_at + is_active=false, does NOT remove the row.
// All bookings, ID proofs, and history are preserved for audit purposes.
// The client is blocked from logging in via the is_active=false check in auth.ts.
export async function deleteClient(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: oldRow } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('clients')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to delete client'));
  }

  if (user) {
    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'DELETE_CLIENT',
      table_name: 'clients',
      record_id: id,
      old_data: oldRow,
    });
  }

  revalidatePath('/dashboard/clients');
}
