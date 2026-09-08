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
  /**
   * GST is charged only when the client supplies a GSTIN. Without one the
   * invoice is totalled at 0% and `total` equals the taxable value.
   */
  clientGstin?: string | null;
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  total: number;
  /**
   * The rate actually applied — `gstRate`, or 0 when the client has no GSTIN.
   * Persist and render THIS, never the requested rate, or a stored invoice
   * will claim a rate it did not charge.
   */
  appliedGstRate: number;
}

/** A GSTIN counts as supplied only if it is a non-empty, non-whitespace string. */
export function hasClientGstin(clientGstin?: string | null): boolean {
  return typeof clientGstin === 'string' && clientGstin.trim().length > 0;
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
  clientGstin,
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

  // No client GSTIN → no GST. The invoice totals straight from the taxable
  // value, and the rate is recorded as 0 rather than the rate that was asked for.
  const appliedGstRate = hasClientGstin(clientGstin) ? gstRate : 0;
  const gstAmount = Math.round((taxableAmount * appliedGstRate) / 100);
  const total = taxableAmount + gstAmount;

  return { subtotal, discountAmount, taxableAmount, gstAmount, total, appliedGstRate };
}
