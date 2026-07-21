import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasAccess } from '@/lib/access';
import { getClientBillingInfo } from '@/actions/invoices';
import { InvoiceBuilder } from '@/components/invoices/InvoiceBuilder';

export const metadata = {
  title: 'New Invoice — Studio ERP',
};

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/dashboard/invoices')) {
    redirect('/dashboard');
  }

  let initialClient: { id: string; name: string; email: string } | null = null;
  if (clientId) {
    const clientInfo = await getClientBillingInfo(clientId);
    if (!clientInfo) notFound();
    initialClient = { id: clientInfo.id, name: clientInfo.name, email: clientInfo.email };
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .is('deleted_at', null)
    .order('name');

  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
        <p className="text-muted-foreground mt-2">
          {initialClient ? `For ${initialClient.name}` : 'Enter every value manually and take a printable copy.'}
        </p>
      </div>
      <InvoiceBuilder initialClient={initialClient} existingClients={clients || []} />
    </div>
  );
}
