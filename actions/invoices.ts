'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminOrSuper } from '@/actions/rental-policy';
import { writeAuditLog } from '@/lib/audit';
import { parseSupabaseError } from '@/lib/errorHandler';
import { calculateInvoiceTotals } from '@/lib/utils/invoice-calc';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  type CreateInvoiceFormData,
  type UpdateInvoiceFormData,
} from '@/lib/validations/invoices';
import { siteConfig } from '@/config/site';
import { logger } from '@/lib/logger';

export async function getClientBillingInfo(clientId: string) {
  const { supabase } = await requireAdminOrSuper();
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, email, phone, address')
    .eq('id', clientId)
    .single();

  if (error || !data) return null;
  return data;
}

async function getNextInvoiceNumber(supabase: any, year: number): Promise<string> {
  const prefix = `INV-${year}-`;
  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`);

  let maxNum = 0;
  const suffixPattern = new RegExp(`^INV-${year}-(\\d+)$`);
  for (const row of data || []) {
    const match = row.invoice_number?.match(suffixPattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `${prefix}${(maxNum + 1).toString().padStart(4, '0')}`;
}

export async function createInvoice(input: CreateInvoiceFormData) {
  const parsed = createInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Invalid invoice data.',
      details: parsed.error.flatten(),
    };
  }
  const data = parsed.data;

  const { supabase, user } = await requireAdminOrSuper();

  const totals = calculateInvoiceTotals({
    items: data.items.map((item) => ({ quantity: item.quantity, unitPrice: item.unitPrice })),
    discountType: data.discountType ?? null,
    discountValue: data.discountValue ?? null,
    gstRate: data.gstRate,
  });

  const year = new Date().getFullYear();
  let invoiceNumber = await getNextInvoiceNumber(supabase, year);
  let invoiceId: string | null = null;
  let lastError: any = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: inserted, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id: data.clientId,
        status: 'ISSUED',
        subtotal: totals.subtotal,
        discount_type: data.discountType || null,
        discount_value: data.discountValue ?? null,
        discount_amount: totals.discountAmount,
        taxable_amount: totals.taxableAmount,
        gst_rate: data.gstRate,
        gst_amount: totals.gstAmount,
        total: totals.total,
        business_gstin: siteConfig.invoice.gstin || null,
        client_gstin: data.clientGstin || null,
        notes: data.notes || null,
        created_by_id: user.id,
      })
      .select('id')
      .single();

    if (!error && inserted) {
      invoiceId = inserted.id;
      lastError = null;
      break;
    }

    if (error?.code === '23505' && error.message?.includes('invoice_number')) {
      const match = invoiceNumber.match(/^INV-\d{4}-(\d+)$/);
      const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
      invoiceNumber = `INV-${year}-${nextNum.toString().padStart(4, '0')}`;
      continue;
    }
    lastError = error;
    break;
  }

  if (!invoiceId) {
    return { error: parseSupabaseError(lastError, 'Failed to create invoice.') };
  }

  const itemRows = data.items.map((item) => ({
    invoice_id: invoiceId,
    description: item.description,
    source_type: item.sourceType,
    source_booking_id: item.sourceBookingId || null,
    quantity: item.quantity,
    unit_price: Math.round(item.unitPrice),
    amount: Math.round(item.quantity * item.unitPrice),
  }));

  const { error: itemsError } = await supabase.from('invoice_items').insert(itemRows);
  if (itemsError) {
    // Roll back the invoice header since its line items failed to attach.
    await supabase.from('invoices').delete().eq('id', invoiceId);
    return { error: parseSupabaseError(itemsError, 'Failed to save invoice line items.') };
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'CREATE_INVOICE',
    table_name: 'invoices',
    record_id: invoiceId,
    new_data: { invoiceNumber, clientId: data.clientId, total: totals.total },
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/clients/${data.clientId}`);

  return { success: true, id: invoiceId, invoiceNumber };
}

export async function getInvoice(id: string) {
  const { supabase } = await requireAdminOrSuper();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(id, name, email, phone, address), items:invoice_items(*), created_by:profiles(fullName)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    if (error) logger.error('getInvoice failed:', error);
    return null;
  }
  return data;
}

export async function listInvoices() {
  const { supabase } = await requireAdminOrSuper();
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, issue_date, status, total, client:clients(name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('listInvoices failed:', error);
    return [];
  }
  return data;
}

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['ISSUED', 'CANCELLED'],
  ISSUED: ['PAID', 'CANCELLED'],
  PAID: ['CANCELLED'],
  CANCELLED: [],
};

export async function updateInvoiceStatus(id: string, nextStatus: 'ISSUED' | 'PAID' | 'CANCELLED') {
  const { supabase, user } = await requireAdminOrSuper();

  const { data: current, error: fetchError } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError || !current) {
    return { error: 'Invoice not found.' };
  }

  if (!ALLOWED_STATUS_TRANSITIONS[current.status]?.includes(nextStatus)) {
    return { error: `Cannot change status from ${current.status} to ${nextStatus}.` };
  }

  const { error } = await supabase.from('invoices').update({ status: nextStatus }).eq('id', id);
  if (error) {
    return { error: parseSupabaseError(error, 'Failed to update invoice status.') };
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'UPDATE_INVOICE_STATUS',
    table_name: 'invoices',
    record_id: id,
    old_data: { status: current.status },
    new_data: { status: nextStatus },
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/invoices/${id}`);
  return { success: true };
}

export async function updateInvoiceDate(id: string, nextIssueDate: string) {
  const { supabase, user } = await requireAdminOrSuper();

  const parsedDate = new Date(nextIssueDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nextIssueDate) || Number.isNaN(parsedDate.getTime())) {
    return { error: 'Invalid date.' };
  }

  const { data: current, error: fetchError } = await supabase
    .from('invoices')
    .select('issue_date')
    .eq('id', id)
    .single();

  if (fetchError || !current) {
    return { error: 'Invoice not found.' };
  }

  if (current.issue_date === nextIssueDate) {
    return { success: true };
  }

  const { error } = await supabase.from('invoices').update({ issue_date: nextIssueDate }).eq('id', id);
  if (error) {
    return { error: parseSupabaseError(error, 'Failed to update invoice date.') };
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'UPDATE_INVOICE_DATE',
    table_name: 'invoices',
    record_id: id,
    old_data: { issue_date: current.issue_date },
    new_data: { issue_date: nextIssueDate },
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/invoices/${id}`);
  return { success: true };
}

const DELETABLE_STATUSES = ['DRAFT', 'CANCELLED'];

// Soft-delete — sets deleted_at, does not remove the row. Only DRAFT/CANCELLED
// invoices qualify: ISSUED/PAID invoices carry a real GST invoice number, and
// deleting one would leave a gap in the invoice-number sequence. Cancel an
// ISSUED/PAID invoice first if it needs to go away.
export async function deleteInvoice(id: string) {
  const { supabase, user } = await requireAdminOrSuper();

  const { data: current, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !current) {
    return { error: 'Invoice not found.' };
  }

  if (!DELETABLE_STATUSES.includes(current.status)) {
    return { error: `Cannot delete a ${current.status.toLowerCase()} invoice. Cancel it first.` };
  }

  const { error } = await supabase
    .from('invoices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { error: parseSupabaseError(error, 'Failed to delete invoice.') };
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'DELETE_INVOICE',
    table_name: 'invoices',
    record_id: id,
    old_data: current,
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/invoices/${id}`);
  return { success: true };
}

// Editing is only allowed while an invoice is ISSUED and unpaid — once PAID
// or CANCELLED, its content is locked. The bill-to client is never editable
// here (see updateInvoiceSchema); only content (items, discount, GST rate,
// client GSTIN, notes) can change. Line items are replaced wholesale rather
// than diffed since the builder UI has no stable item identity to match on.
export async function updateInvoice(id: string, input: UpdateInvoiceFormData) {
  const parsed = updateInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Invalid invoice data.',
      details: parsed.error.flatten(),
    };
  }
  const data = parsed.data;

  const { supabase, user } = await requireAdminOrSuper();

  const { data: current, error: fetchError } = await supabase
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !current) {
    return { error: 'Invoice not found.' };
  }

  if (current.status !== 'ISSUED') {
    return { error: `Cannot edit a ${current.status.toLowerCase()} invoice.` };
  }

  const totals = calculateInvoiceTotals({
    items: data.items.map((item) => ({ quantity: item.quantity, unitPrice: item.unitPrice })),
    discountType: data.discountType ?? null,
    discountValue: data.discountValue ?? null,
    gstRate: data.gstRate,
  });

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      subtotal: totals.subtotal,
      discount_type: data.discountType || null,
      discount_value: data.discountValue ?? null,
      discount_amount: totals.discountAmount,
      taxable_amount: totals.taxableAmount,
      gst_rate: data.gstRate,
      gst_amount: totals.gstAmount,
      total: totals.total,
      client_gstin: data.clientGstin || null,
      notes: data.notes || null,
    })
    .eq('id', id);

  if (updateError) {
    return { error: parseSupabaseError(updateError, 'Failed to update invoice.') };
  }

  const { error: deleteItemsError } = await supabase.from('invoice_items').delete().eq('invoice_id', id);
  if (deleteItemsError) {
    return { error: parseSupabaseError(deleteItemsError, 'Failed to update invoice line items.') };
  }

  const itemRows = data.items.map((item) => ({
    invoice_id: id,
    description: item.description,
    source_type: item.sourceType,
    source_booking_id: item.sourceBookingId || null,
    quantity: item.quantity,
    unit_price: Math.round(item.unitPrice),
    amount: Math.round(item.quantity * item.unitPrice),
  }));

  const { error: itemsError } = await supabase.from('invoice_items').insert(itemRows);
  if (itemsError) {
    // Best-effort restore of the old items so the invoice isn't left blank
    // after the delete above — not a real transaction, but better than nothing.
    const restoreRows = (current.items || []).map((item: any) => ({
      invoice_id: id,
      description: item.description,
      source_type: item.source_type,
      source_booking_id: item.source_booking_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
    }));
    if (restoreRows.length > 0) {
      await supabase.from('invoice_items').insert(restoreRows);
    }
    return { error: parseSupabaseError(itemsError, 'Failed to save invoice line items.') };
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'UPDATE_INVOICE',
    table_name: 'invoices',
    record_id: id,
    old_data: current,
    new_data: { ...totals, gstRate: data.gstRate, clientGstin: data.clientGstin, notes: data.notes, items: data.items },
  });

  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/invoices/${id}`);
  return { success: true };
}
