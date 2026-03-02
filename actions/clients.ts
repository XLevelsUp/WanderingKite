'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { clientSchema } from '@/lib/validations/schemas';

// Get all clients
export async function getClients() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch clients: ${error.message}`);
  }

  return data;
}

// Create client
export async function createNewClient(formData: FormData) {
  const supabase = await createClient();

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
    throw new Error(`Failed to create client: ${error.message}`);
  }

  revalidatePath('/dashboard/clients');
  return data;
}

// Update client
export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient();

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
    throw new Error(`Failed to update client: ${error.message}`);
  }

  revalidatePath('/dashboard/clients');
  return data;
}

// Delete client
export async function deleteClient(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete client: ${error.message}`);
  }

  revalidatePath('/dashboard/clients');
}
