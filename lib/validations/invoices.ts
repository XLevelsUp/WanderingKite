import { z } from 'zod';

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(300),
  sourceType: z.enum(['PHOTOGRAPHY', 'STUDIO', 'RENTAL', 'CUSTOM']).default('CUSTOM'),
  sourceBookingId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
});

export type InvoiceLineItemFormData = z.infer<typeof invoiceLineItemSchema>;

const invoiceContentFields = {
  items: z.array(invoiceLineItemSchema).min(1, 'Add at least one line item'),
  discountType: z.enum(['PERCENTAGE', 'FLAT']).optional().nullable(),
  discountValue: z.number().min(0, 'Discount must be non-negative').optional().nullable(),
  gstRate: z.number().min(0).max(100).default(18),
  clientGstin: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Invalid GSTIN format')
    .optional()
    .or(z.literal(''))
    .nullable(),
  notes: z.string().max(1000).optional().or(z.literal('')),
};

const discountValueRequiredWhenTypeSet = {
  message: 'Enter a discount value for the selected discount type',
  path: ['discountValue'] as PropertyKey[],
};

function requiresDiscountValue(data: { discountType?: string | null; discountValue?: number | null }) {
  return !data.discountType || (data.discountValue !== undefined && data.discountValue !== null);
}

export const createInvoiceSchema = z
  .object({
    clientId: z.string().uuid('Select a valid client'),
    ...invoiceContentFields,
  })
  .refine(requiresDiscountValue, discountValueRequiredWhenTypeSet);

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

// Same content as createInvoiceSchema, minus clientId — an ISSUED invoice's
// bill-to client is fixed; only its content (items/discount/GST/notes) can
// be edited before it's paid.
export const updateInvoiceSchema = z
  .object({ ...invoiceContentFields })
  .refine(requiresDiscountValue, discountValueRequiredWhenTypeSet);

export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;
