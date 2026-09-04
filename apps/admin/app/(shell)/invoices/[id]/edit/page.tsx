import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getInvoice } from '@/actions/invoices';
import { InvoiceBuilder } from '@/components/invoices/InvoiceBuilder';

export const metadata = {
  title: 'Edit Invoice — Studio ERP',
};

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  // Editing is only allowed while the invoice is issued and unpaid — same
  // rule enforced server-side in updateInvoice(). Redirect back to the
  // read-only view rather than letting an already-PAID/CANCELLED invoice
  // land on a form it can't submit.
  if (invoice.status !== 'ISSUED') {
    redirect(`/invoices/${id}`);
  }

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .is('deleted_at', null)
    .order('name');

  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Invoice {invoice.invoice_number}</h1>
        <p className="text-muted-foreground mt-2">For {invoice.client.name}</p>
      </div>
      <InvoiceBuilder
        mode="edit"
        invoiceId={invoice.id}
        initialClient={{ id: invoice.client.id, name: invoice.client.name, email: invoice.client.email }}
        existingClients={clients || []}
        gstRate={Number(invoice.gst_rate)}
        initialItems={invoice.items.map((item: any) => ({ description: item.description, unitPrice: item.unit_price }))}
        initialDiscountType={invoice.discount_type}
        initialDiscountValue={invoice.discount_value != null ? Number(invoice.discount_value) : null}
        initialClientGstin={invoice.client_gstin}
        initialNotes={invoice.notes}
      />
    </div>
  );
}
