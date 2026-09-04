import { z } from 'zod';

export const studioPackageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.number().int().min(0, 'Offer price must be non-negative'),
  originalPrice: z.number().int().min(0, 'Actual price must be non-negative'),
  durationLabel: z.string().min(1, 'Duration label is required').max(50),
  description: z.string().max(500).optional().default(''),
  isBestValue: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type StudioPackageFormData = z.infer<typeof studioPackageSchema>;

export const studioAddOnSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.number().int().min(0, 'Price must be non-negative'),
  unit: z.string().min(1).max(20).optional().default('hr'),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type StudioAddOnFormData = z.infer<typeof studioAddOnSchema>;
