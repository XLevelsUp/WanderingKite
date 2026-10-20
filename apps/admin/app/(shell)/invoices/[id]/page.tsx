import { notFound } from 'next/navigation';
import { getInvoice } from '@/actions/invoices';
import { InvoiceView, type InvoiceRecord } from '@/components/invoices/InvoiceView';

export const metadata = {
  title: 'Invoice — Studio ERP',
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  return <InvoiceView invoice={invoice as unknown as InvoiceRecord} />;
}
