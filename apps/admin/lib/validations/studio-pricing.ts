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

export const podcastPackageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.number().int().min(0, 'Offer price must be non-negative'),
  // Optional: these packages have no genuine "was" price today, and the
  // strike-through / % OFF badge only renders when one is actually set. An
  // empty field arrives as null rather than 0, so the badge stays hidden.
  originalPrice: z.number().int().min(0, 'Actual price must be non-negative').nullable().optional().default(null),
  durationLabel: z.string().min(1, 'Duration label is required').max(50),
  description: z.string().max(500).optional().default(''),
  // Edited as one-per-line text in the admin form; blank lines are dropped.
  features: z.array(z.string().min(1).max(200)).max(20).optional().default([]),
  isPopular: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type PodcastPackageFormData = z.infer<typeof podcastPackageSchema>;

export const studioAddOnSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.number().int().min(0, 'Price must be non-negative'),
  unit: z.string().min(1).max(20).optional().default('hr'),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type StudioAddOnFormData = z.infer<typeof studioAddOnSchema>;
