'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientCombobox, type ClientOption } from '@/app/(dashboard)/dashboard/media-tracker/ClientCombobox';
import { createNewClient, findClientByEmail } from '@/actions/clients';
import { createInvoice, updateInvoice } from '@/actions/invoices';
import { calculateInvoiceTotals, type DiscountType } from '@/lib/utils/invoice-calc';

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

let itemKeySeq = 0;
function newItemKey() {
  itemKeySeq += 1;
  return `item-${itemKeySeq}`;
}

interface LineItemRow {
  key: string;
  description: string;
  unitPrice: string;
}

interface InvoiceBuilderProps {
  /** Pre-resolved client (e.g. arrived via ?clientId= from the client detail page) — hides the existing/new radio. Always set (and locked) in edit mode. */
  initialClient?: { id: string; name: string; email: string } | null;
  existingClients?: ClientOption[];
  gstRate?: number;
  /** 'edit' locks the client, prefills content from initial* props, calls updateInvoice, and disables the GST-rate/notes/etc fields from resetting on remount. */
  mode?: 'create' | 'edit';
  invoiceId?: string;
  initialItems?: { description: string; unitPrice: number }[];
  initialDiscountType?: DiscountType | null;
  initialDiscountValue?: number | null;
  initialClientGstin?: string | null;
  initialNotes?: string | null;
}

export function InvoiceBuilder({
  initialClient = null,
  existingClients = [],
  gstRate: defaultGstRate = 18,
  mode = 'create',
  invoiceId,
  initialItems,
  initialDiscountType = null,
  initialDiscountValue = null,
  initialClientGstin = null,
  initialNotes = null,
}: InvoiceBuilderProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [clientMode, setClientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [clientList, setClientList] = useState(existingClients);
  const [selectedClientId, setSelectedClientId] = useState(initialClient?.id ?? '');

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const [lineItems, setLineItems] = useState<LineItemRow[]>(() =>
    initialItems && initialItems.length > 0
      ? initialItems.map((item) => ({ key: newItemKey(), description: item.description, unitPrice: String(item.unitPrice) }))
      : [{ key: newItemKey(), description: '', unitPrice: '' }]
  );
  const [discountType, setDiscountType] = useState<'NONE' | DiscountType>(initialDiscountType ?? 'NONE');
  const [discountValue, setDiscountValue] = useState(initialDiscountValue != null ? String(initialDiscountValue) : '');
  const [gstRate, setGstRate] = useState(defaultGstRate);
  const [clientGstin, setClientGstin] = useState(initialClientGstin ?? '');
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { key: newItemKey(), description: '', unitPrice: '' }]);
  };

  const updateLineItem = (key: string, field: 'description' | 'unitPrice', value: string) => {
    setLineItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const removeLineItem = (key: string) => {
    setLineItems((prev) => prev.filter((item) => item.key !== key));
  };

  const validItems = useMemo(
    () =>
      lineItems
        .filter((item) => item.description.trim() && item.unitPrice.trim())
        .map((item) => ({
          description: item.description.trim(),
          sourceType: 'CUSTOM' as const,
          sourceBookingId: null,
          quantity: 1,
          unitPrice: Number(item.unitPrice) || 0,
        })),
    [lineItems]
  );

  const totals = useMemo(() => {
    return calculateInvoiceTotals({
      items: validItems,
      discountType: discountType === 'NONE' ? null : discountType,
      discountValue: discountValue ? Number(discountValue) : null,
      gstRate,
    });
  }, [validItems, discountType, discountValue, gstRate]);

  const handleUpdate = async () => {
    setError('');

    if (validItems.length === 0) {
      setError('Add at least one line item with a description and amount.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateInvoice(invoiceId!, {
        items: validItems,
        discountType: discountType === 'NONE' ? null : discountType,
        discountValue: discountValue ? Number(discountValue) : null,
        gstRate,
        clientGstin: clientGstin.trim() || null,
        notes: notes.trim() || undefined,
      });

      if ('error' in result && result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success('Invoice updated.');
      router.push(`/dashboard/invoices/${invoiceId}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to update invoice.');
      toast.error(err?.message || 'Failed to update invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isEdit) return handleUpdate();

    setError('');

    if (validItems.length === 0) {
      setError('Add at least one line item with a description and amount.');
      return;
    }
    if (!initialClient) {
      if (clientMode === 'EXISTING' && !selectedClientId) {
        setError('Select a client.');
        return;
      }
      if (clientMode === 'NEW' && !newClientName.trim()) {
        setError("Enter the client's name.");
        return;
      }
    }

    setSubmitting(true);
    try {
      let clientId = initialClient?.id ?? selectedClientId;

      if (!initialClient && clientMode === 'NEW') {
        // Email is optional here — only use what was typed if it actually
        // looks like an email, otherwise fall back to a placeholder rather
        // than blocking invoice creation on a strict format check.
        const typedEmail = newClientEmail.trim();
        const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typedEmail);
        const emailToUse = looksLikeEmail ? typedEmail : `${Date.now().toString(36)}@noemail.placeholder`;

        // No uniqueness requirement for this quick-entry path: if a client
        // already exists with that email (even the same one twice in a
        // row), just bill that existing record instead of erroring —
        // duplicates aren't blocked here, they're just reused.
        const existing = looksLikeEmail ? await findClientByEmail(emailToUse) : null;

        if (existing) {
          clientId = existing.id;
        } else {
          const formData = new FormData();
          formData.set('name', newClientName.trim());
          formData.set('email', emailToUse);
          if (newClientPhone.trim()) formData.set('phone', newClientPhone.trim());
          if (newClientAddress.trim()) formData.set('address', newClientAddress.trim());

          const created = await createNewClient(formData);
          if ('error' in created && created.error) {
            // Rare race: someone else created a client with this email
            // between our check and this insert — reuse it rather than
            // surfacing an error.
            const fallback = looksLikeEmail ? await findClientByEmail(emailToUse) : null;
            if (fallback) {
              clientId = fallback.id;
            } else {
              setError(created.error);
              toast.error(created.error);
              return;
            }
          } else {
            clientId = created.client.id;
          }
        }
      }

      const result = await createInvoice({
        clientId,
        items: validItems,
        discountType: discountType === 'NONE' ? null : discountType,
        discountValue: discountValue ? Number(discountValue) : null,
        gstRate,
        clientGstin: clientGstin.trim() || null,
        notes: notes.trim() || undefined,
      });

      if ('error' in result && result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(`Invoice ${result.invoiceNumber} created.`);
      router.push(`/dashboard/invoices/${result.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create invoice.');
      toast.error(err?.message || 'Failed to create invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bill To</CardTitle>
          {initialClient && <CardDescription>{initialClient.name} · {initialClient.email}</CardDescription>}
        </CardHeader>
        {!initialClient && (
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="clientMode"
                  checked={clientMode === 'EXISTING'}
                  onChange={() => setClientMode('EXISTING')}
                />
                Existing Client
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="clientMode"
                  checked={clientMode === 'NEW'}
                  onChange={() => setClientMode('NEW')}
                />
                New Client
              </label>
            </div>

            {clientMode === 'EXISTING' ? (
              <div className="max-w-sm">
                <ClientCombobox
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                  clients={clientList}
                  onClientCreated={(c) => setClientList((prev) => [...prev, c])}
                  allowCreate={false}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Client name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} placeholder="Optional" />
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>Type what to show on the bill and its amount.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lineItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(item.key, 'description', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                min="0"
                placeholder="Amount"
                value={item.unitPrice}
                onChange={(e) => updateLineItem(item.key, 'unitPrice', e.target.value)}
                className="w-36"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLineItem(item.key)}
                disabled={lineItems.length === 1}
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discount &amp; GST</CardTitle>
        </CardHeader>
        <CardContent className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${isEdit ? 'sm:grid-cols-4' : ''}`}>
          <div className="space-y-1.5">
            <Label>Discount Type</Label>
            <Select value={discountType} onValueChange={(v) => setDiscountType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">No discount</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                <SelectItem value="FLAT">Flat amount (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Discount Value</Label>
            <Input
              type="number"
              min="0"
              disabled={discountType === 'NONE'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 500'}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Client GSTIN (optional)</Label>
            <Input
              value={clientGstin}
              onChange={(e) => setClientGstin(e.target.value.toUpperCase())}
              placeholder="For B2B input tax credit"
              maxLength={15}
            />
          </div>
          {isEdit && (
            <div className="space-y-1.5">
              <Label>GST Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value) || 0)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes to print on the invoice"
            rows={3}
          />
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">{fmt(totals.subtotal)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-500">
              <span>
                Discount {discountType === 'PERCENTAGE' ? `(${discountValue}%)` : ''}
              </span>
              <span className="font-mono">− {fmt(totals.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxable Value</span>
            <span className="font-mono">{fmt(totals.taxableAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CGST @ {gstRate / 2}%</span>
            <span className="font-mono">{fmt(Math.round(totals.gstAmount / 2))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SGST @ {gstRate / 2}%</span>
            <span className="font-mono">{fmt(totals.gstAmount - Math.round(totals.gstAmount / 2))}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span>Total</span>
            <span className="font-mono">{fmt(totals.total)}</span>
          </div>

          {error && <p className="text-sm text-rose-500 pt-2">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={submitting || validItems.length === 0}
            className="w-full mt-4"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4 mr-2" />
            )}
            {isEdit ? 'Save Changes' : 'Generate Invoice'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
