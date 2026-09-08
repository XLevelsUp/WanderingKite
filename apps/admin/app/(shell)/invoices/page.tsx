import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasAccess } from '@/lib/access';
import { listInvoices } from '@/actions/invoices';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Receipt } from 'lucide-react';

export const metadata = {
  title: 'Invoices — Studio ERP',
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  ISSUED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function fmt(n: number) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

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
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-accent/40">
                  <TableCell className="font-medium">
                    <Link href={`/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoice_number}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.client?.name ?? '—'}</TableCell>
                  <TableCell>{new Date(inv.issue_date).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STATUS_STYLES[inv.status] ?? ''}`}>
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{fmt(inv.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
