'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { Download, FileDown, ArrowLeft, CheckCircle2, Ban, Loader2, Pencil, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { updateInvoiceStatus, updateInvoiceDate, deleteInvoice } from '@/actions/invoices';
import { siteConfig } from '@/config/site';
import { brandConfig } from '@/config/brand.config';

function fmt(n: number) {
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface InvoiceItemRow {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  subtotal: number;
  discount_type: 'PERCENTAGE' | 'FLAT' | null;
  discount_value: number | null;
  discount_amount: number;
  taxable_amount: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  business_gstin: string | null;
  client_gstin: string | null;
  notes: string | null;
  client: { id: string; name: string; email: string; phone: string | null; address: string | null };
  items: InvoiceItemRow[];
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  ISSUED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function InvoiceDocument({
  invoice,
  status,
  issueDate,
}: {
  invoice: InvoiceRecord;
  status: InvoiceRecord['status'];
  issueDate: string;
}) {
  return (
    <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none border border-gray-100 print:w-full print:border-0 print:m-0">
      {/* Header */}
      <div className="bg-gray-950 px-6 py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-800 text-white print:px-4 print:py-3 print:bg-white print:text-black print:border-b-2 print:border-gray-300">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary opacity-80 mb-1 print:text-gray-500">
            Tax Invoice
          </p>
          <h1 className="text-lg font-bold tracking-tight">{brandConfig.name}</h1>
          <p className="text-[10px] text-gray-400 mt-1 print:text-gray-600 max-w-xs">
            {siteConfig.contact.address.street}, {siteConfig.contact.address.city} — {siteConfig.contact.address.zip}
          </p>
          {invoice.business_gstin && (
            <p className="text-[10px] text-gray-400 print:text-gray-600">GSTIN: {invoice.business_gstin}</p>
          )}
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-bold text-white print:text-black">{invoice.invoice_number}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 print:text-gray-600">
            Issued {new Date(issueDate).toLocaleDateString('en-IN')}
          </p>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${STATUS_STYLES[status]} print:border-gray-400 print:text-black print:bg-transparent`}>
            {status}
          </span>
        </div>
      </div>

      {/* Bill To */}
      <div className="p-4 print:p-3 border-b border-gray-100">
        <p className="font-bold uppercase tracking-wider text-gray-400 mb-1 text-[9px]">Bill To</p>
        <p className="font-bold text-gray-900 text-sm">{invoice.client.name}</p>
        <p className="text-[11px] text-gray-500">{invoice.client.email}</p>
        {invoice.client.phone && <p className="text-[11px] text-gray-500">{invoice.client.phone}</p>}
        {invoice.client.address && <p className="text-[11px] text-gray-500">{invoice.client.address}</p>}
        {invoice.client_gstin && <p className="text-[11px] text-gray-500 mt-1">Client GSTIN: {invoice.client_gstin}</p>}
      </div>

      {/* Line items */}
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-gray-50 print:bg-gray-100">
            <th className="py-1.5 px-4 text-left text-[9px] font-bold uppercase tracking-wider text-gray-500">Description</th>
            <th className="py-1.5 px-4 text-right text-[9px] font-bold uppercase tracking-wider text-gray-500">Qty</th>
            <th className="py-1.5 px-4 text-right text-[9px] font-bold uppercase tracking-wider text-gray-500">Unit Price</th>
            <th className="py-1.5 px-4 text-right text-[9px] font-bold uppercase tracking-wider text-gray-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td className="py-1.5 px-4 text-gray-700 border-b border-gray-100">{item.description}</td>
              <td className="py-1.5 px-4 text-right text-gray-700 border-b border-gray-100">{item.quantity}</td>
              <td className="py-1.5 px-4 text-right text-gray-700 border-b border-gray-100 tabular-nums">{fmt(item.unit_price)}</td>
              <td className="py-1.5 px-4 text-right text-gray-900 font-semibold border-b border-gray-100 tabular-nums">{fmt(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="p-4 print:p-3 flex justify-end">
        <div className="w-full sm:w-64 space-y-1 text-[11px]">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="tabular-nums">{fmt(invoice.subtotal)}</span>
          </div>
          {invoice.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>
                Discount {invoice.discount_type === 'PERCENTAGE' ? `(${invoice.discount_value}%)` : ''}
              </span>
              <span className="tabular-nums">− {fmt(invoice.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Taxable Value</span>
            <span className="tabular-nums">{fmt(invoice.taxable_amount)}</span>
          </div>
          {(() => {
            const halfRate = Number(invoice.gst_rate) / 2;
            const cgst = Math.round(invoice.gst_amount / 2);
            const sgst = invoice.gst_amount - cgst;
            return (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>CGST @ {halfRate}%</span>
                  <span className="tabular-nums">{fmt(cgst)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SGST @ {halfRate}%</span>
                  <span className="tabular-nums">{fmt(sgst)}</span>
                </div>
              </>
            );
          })()}
          <div className="flex justify-between font-bold text-gray-900 text-sm pt-1.5 mt-1.5 border-t border-gray-200">
            <span>Total</span>
            <span className="tabular-nums">{fmt(invoice.total)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="px-4 pb-3 print:px-3">
          <p className="text-[10px] text-gray-500 italic whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center text-gray-400 print:border-t-0">
        <p className="text-[8px]">
          This is a computer-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
}

export function InvoiceView({ invoice }: { invoice: InvoiceRecord }) {
  const router = useRouter();
  const [status, setStatus] = useState(invoice.status);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [issueDate, setIssueDate] = useState(invoice.issue_date);
  const [editingDate, setEditingDate] = useState(false);
  const [dateInput, setDateInput] = useState(invoice.issue_date.slice(0, 10));
  const [savingDate, setSavingDate] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSaveDate = async () => {
    if (!dateInput) return;
    setSavingDate(true);
    try {
      const result = await updateInvoiceDate(invoice.id, dateInput);
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      setIssueDate(dateInput);
      setEditingDate(false);
      toast.success('Invoice date updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update invoice date.');
    } finally {
      setSavingDate(false);
    }
  };

  const handleCancelDateEdit = () => {
    setDateInput(issueDate.slice(0, 10));
    setEditingDate(false);
  };

  const handleStatusChange = async (next: 'PAID' | 'CANCELLED') => {
    setBusy(true);
    try {
      const result = await updateInvoiceStatus(invoice.id, next);
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      setStatus(next);
      toast.success(`Invoice marked as ${next.toLowerCase()}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update invoice status.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteInvoice(invoice.id);
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Invoice deleted.');
      router.push('/invoices');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete invoice.');
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const handlePrint = () => {
    // Chrome only draws its default header (page title) / footer (date, URL,
    // page number) inside the @page margin area — with it zeroed out (below)
    // there's nothing to draw. Blanking the title too covers browsers that
    // still print it regardless.
    const originalTitle = document.title;
    document.title = invoice.invoice_number;
    window.print();
    document.title = originalTitle;
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('invoice-preview-capture');
    if (!element) return;

    setDownloadingPdf(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ unit: 'mm', format: 'a5' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoice.invoice_number}.pdf`);
    } catch (err) {
      toast.error('Failed to generate PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A5; margin: 0; }
        @media print {
          /* Hide everything by default; only the portal-rendered copy (a
             direct child of body, sitting outside the dashboard layout) is
             switched back on below. This avoids the classic "blank second
             page" caused by hidden dashboard chrome (sidebar/nav) still
             reserving its layout height under visibility:hidden. */
          body > * { display: none !important; }
          #invoice-print-root { display: block !important; padding: 10mm; }
        }
      `}} />

      {/* Screen-only controls */}
      <div className="print:hidden flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-foreground/40">Issued</span>
          {editingDate ? (
            <span className="inline-flex items-center gap-1.5">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="text-xs px-2 py-1 rounded-md border border-border bg-background"
                autoFocus
              />
              <button
                onClick={handleSaveDate}
                disabled={savingDate}
                title="Save date"
                className="text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
              >
                {savingDate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={handleCancelDateEdit}
                disabled={savingDate}
                title="Cancel"
                className="text-rose-500 hover:text-rose-400 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              {new Date(issueDate).toLocaleDateString('en-IN')}
              <button
                onClick={() => setEditingDate(true)}
                title="Change invoice date"
                className="text-foreground/40 hover:text-primary transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status === 'ISSUED' && (
            <>
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Button size="sm" variant="outline">
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              </Link>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => handleStatusChange('PAID')}>
                {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-500" />}
                Mark Paid
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => handleStatusChange('CANCELLED')}>
                <Ban className="h-4 w-4 mr-1.5 text-rose-500" />
                Cancel
              </Button>
            </>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/35 bg-primary/8 text-xs font-bold text-primary hover:bg-primary/18 hover:border-primary/60 transition-all disabled:opacity-50"
          >
            {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/35 bg-primary/8 text-xs font-bold text-primary hover:bg-primary/18 hover:border-primary/60 transition-all"
          >
            <Download className="h-4 w-4" />
            Download / Print
          </button>
          {(status === 'DRAFT' || status === 'CANCELLED') && (
            <Button
              size="sm"
              variant="outline"
              disabled={deleting}
              onClick={() => setConfirmingDelete(true)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* On-screen preview (also the source captured for the PDF download) */}
      <div id="invoice-preview-capture">
        <InvoiceDocument invoice={invoice} status={status} issueDate={issueDate} />
      </div>

      {/* Print-only copy, portaled to <body> so hidden dashboard chrome can't leave behind blank pages */}
      {mounted && createPortal(
        <div id="invoice-print-root" className="hidden print:block">
          <InvoiceDocument invoice={invoice} status={status} issueDate={issueDate} />
        </div>,
        document.body
      )}

      <AnimatePresence>
        {confirmingDelete && (
          <Modal
            id={`delete-invoice-${invoice.id}`}
            title="Delete Invoice"
            description={`Delete ${invoice.invoice_number}? This hides it from the invoices list. The record and its audit history are kept, not removed.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
