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
import { createNewClient } from '@/actions/clients';
import { createInvoice } from '@/actions/invoices';
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
  /** Pre-resolved client (e.g. arrived via ?clientId= from the client detail page) — hides the existing/new radio. */
  initialClient?: { id: string; name: string; email: string } | null;
  existingClients?: ClientOption[];
  gstRate?: number;
}

export function InvoiceBuilder({ initialClient = null, existingClients = [], gstRate = 18 }: InvoiceBuilderProps) {
  const router = useRouter();

  const [clientMode, setClientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [clientList, setClientList] = useState(existingClients);
  const [selectedClientId, setSelectedClientId] = useState(initialClient?.id ?? '');

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const [lineItems, setLineItems] = useState<LineItemRow[]>(() => [
    { key: newItemKey(), description: '', unitPrice: '' },
  ]);
  const [discountType, setDiscountType] = useState<'NONE' | DiscountType>('NONE');
  const [discountValue, setDiscountValue] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [notes, setNotes] = useState('');
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

  const handleSubmit = async () => {
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
        const formData = new FormData();
        formData.set('name', newClientName.trim());
        formData.set('email', newClientEmail.trim() || `${Date.now().toString(36)}@noemail.placeholder`);
        if (newClientPhone.trim()) formData.set('phone', newClientPhone.trim());
        if (newClientAddress.trim()) formData.set('address', newClientAddress.trim());

        const created = await createNewClient(formData);
        clientId = created.id;
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
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <span className="text-muted-foreground">GST @ {gstRate}%</span>
            <span className="font-mono">{fmt(totals.gstAmount)}</span>
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
            Generate Invoice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
