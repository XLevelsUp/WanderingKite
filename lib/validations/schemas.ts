import { z } from 'zod';

// Equipment Validation
export const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  categoryId: z.string().uuid('Invalid category'),
  branchId: z.string().uuid('Invalid branch'),
  rentalPrice: z.number().positive('Price must be positive'),
  description: z.string().optional().nullable(),
});

export type EquipmentFormData = z.infer<typeof equipmentSchema>;

// Client Validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  govtId: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Rental Validation
export const rentalSchema = z.object({
  client_id: z.string().uuid('Invalid client'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
  equipment_ids: z
    .array(z.string().uuid())
    .min(1, 'At least one equipment item required'),
});

export type RentalFormData = z.infer<typeof rentalSchema>;

// Category Validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Branch Validation
export const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  location: z.string().min(1, 'Location is required'),
});

export type BranchFormData = z.infer<typeof branchSchema>;

// Equipment Assignment Validation (Field Operations / Triad View)
export const assignmentSchema = z.object({
  equipmentId: z.string().uuid('Invalid equipment ID'),
  employeeId: z.string().uuid('Invalid employee ID'),
  clientId: z.string().uuid('Invalid client ID').optional(),
  expectedReturn: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional(),
  location: z.string().min(1).max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;

// Quick Return — minimal schema (just needs the UUID)
export const quickReturnSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment ID'),
  notes: z.string().max(500).optional(),
});

export type QuickReturnFormData = z.infer<typeof quickReturnSchema>;
