'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { clientSchema, CLIENT_SOURCES, SOURCE_REQUIRES_DETAIL, type ClientSource } from '@/lib/validations/schemas';
import { parseSupabaseError } from '@/lib/errorHandler';
import { writeAuditLog } from '@/lib/audit';

// Get all clients — excludes soft-deleted rows
export async function getClients() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*, client_services(type)')
    .is('deletedAt', null)          // hide soft-deleted clients
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch client lists.'));
  }

  return data ?? [];
}

// Find a client (active or soft-deleted) by exact email match.
// Used so ad-hoc client entry (e.g. quick invoice billing) can reuse an
// existing record instead of failing on the clients.email unique constraint.
export async function findClientByEmail(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, email, phone, address, deleted_at')
    .eq('email', email)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

// Create client
// Note: returns { error } instead of throwing on expected failures (bad
// input, duplicate email) — Next.js redacts thrown Server Action errors to a
// generic message in production regardless of content, so a real message
// can only reach the client as a normal returned value, not a throw.
export async function createNewClient(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rawSource = (formData.get('source') as string) || undefined;
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    govtId: (formData.get('govt_id') as string) || undefined,
    source: rawSource as any,
    sourceDetail: rawSource === SOURCE_REQUIRES_DETAIL
      ? ((formData.get('source_detail') as string) || undefined)
      : undefined,
  };

  // Validate
  const parsed = clientSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid client data.' };
  }
  const validatedData = parsed.data;

  const { source, sourceDetail, govtId, ...rest } = validatedData;
  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...rest,
      govtId,
      source: source ?? null,
      source_detail: source === SOURCE_REQUIRES_DETAIL ? (sourceDetail ?? null) : null,
    })
    .select()
    .single();

  if (error) {
    return { error: parseSupabaseError(error, 'Failed to create client') };
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

  revalidatePath('/clients');
  return { client: data };
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

  const rawSource = (formData.get('source') as string) || undefined;
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    govtId: (formData.get('govt_id') as string) || undefined,
    source: rawSource as any,
    sourceDetail: rawSource === SOURCE_REQUIRES_DETAIL
      ? ((formData.get('source_detail') as string) || undefined)
      : undefined,
  };

  // Validate
  const parsed = clientSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Invalid client data.');
  }
  const validatedData = parsed.data;

  const { source, sourceDetail, govtId, ...rest } = validatedData;
  const { data, error } = await supabase
    .from('clients')
    .update({
      ...rest,
      govtId,
      source: source ?? null,
      source_detail: source === SOURCE_REQUIRES_DETAIL ? (sourceDetail ?? null) : null,
    })
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

  revalidatePath('/clients');
  return data;
}

// Soft-delete client — sets deletedAt + is_active=false, does NOT remove the row.
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
    .update({ deletedAt: new Date().toISOString(), is_active: false })
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

  revalidatePath('/clients');
}

// Update only the referral source for an existing client
export async function updateClientSource(
  id: string,
  source: ClientSource | null,
  sourceDetail: string | null,
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // source is NOT NULL in the database — reject a clear here rather than
  // letting it surface as an opaque constraint violation.
  if (source === null) {
    throw new Error('Please select how they found us');
  }
  if (!(CLIENT_SOURCES as readonly string[]).includes(source)) {
    throw new Error('Invalid source value');
  }
  if (source === SOURCE_REQUIRES_DETAIL && !sourceDetail?.trim()) {
    throw new Error('Please specify which social media platform');
  }

  const { data: oldRow } = await supabase
    .from('clients')
    .select('source, source_detail')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('clients')
    .update({
      source: source ?? null,
      source_detail: source === SOURCE_REQUIRES_DETAIL ? (sourceDetail ?? null) : null,
    })
    .eq('id', id);

  if (error) throw new Error(parseSupabaseError(error, 'Failed to update referral source'));

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'UPDATE_CLIENT_SOURCE',
    table_name: 'clients',
    record_id: id,
    old_data: oldRow,
    new_data: { source, source_detail: source === SOURCE_REQUIRES_DETAIL ? sourceDetail : null },
  });

  revalidatePath(`/clients/${id}`);
  revalidatePath('/clients');
}
