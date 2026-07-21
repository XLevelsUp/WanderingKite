import { z } from 'zod';

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(300),
  sourceType: z.enum(['PHOTOGRAPHY', 'STUDIO', 'RENTAL', 'CUSTOM']).default('CUSTOM'),
  sourceBookingId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
});

export type InvoiceLineItemFormData = z.infer<typeof invoiceLineItemSchema>;

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid('Select a valid client'),
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
}).refine(
  (data) => !data.discountType || (data.discountValue !== undefined && data.discountValue !== null),
  { message: 'Enter a discount value for the selected discount type', path: ['discountValue'] }
);

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
