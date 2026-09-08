export type DiscountType = 'PERCENTAGE' | 'FLAT';

export interface InvoiceLineInput {
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTotalsInput {
  items: InvoiceLineInput[];
  discountType?: DiscountType | null;
  discountValue?: number | null;
  gstRate: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  total: number;
}

/**
 * Single source of truth for invoice math — used for the live preview while
 * building an invoice AND as the authoritative server-side recalculation.
 * Never trust client-submitted totals for money; always recompute with this.
 */
export function calculateInvoiceTotals({
  items,
  discountType,
  discountValue,
  gstRate,
}: InvoiceTotalsInput): InvoiceTotals {
  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  );

  let discountAmount = 0;
  if (discountType === 'PERCENTAGE' && discountValue) {
    discountAmount = Math.round((subtotal * discountValue) / 100);
  } else if (discountType === 'FLAT' && discountValue) {
    discountAmount = Math.round(discountValue);
  }
  // Clamp so a discount can never exceed (or negate) the subtotal.
  discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

  const taxableAmount = subtotal - discountAmount;
  const gstAmount = Math.round((taxableAmount * gstRate) / 100);
  const total = taxableAmount + gstAmount;

  return { subtotal, discountAmount, taxableAmount, gstAmount, total };
}
