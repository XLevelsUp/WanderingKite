import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasAccess } from '@/lib/access';
import { listInvoices } from '@/actions/invoices';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';
import { InvoiceMonthBrowser, type InvoiceRow } from './InvoiceMonthBrowser';

export const metadata = {
  title: 'Invoices — Studio ERP',
};

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/invoices')) {
    redirect('/');
  }

  const invoices = await listInvoices();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-2">
            Generate and track GST invoices for clients.
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
          <Receipt className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
          <Link href="/invoices/new" className="mt-4">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Create your first invoice
            </Button>
          </Link>
        </div>
      ) : (
        <InvoiceMonthBrowser invoices={invoices as unknown as InvoiceRow[]} />
      )}
    </div>
  );
}
