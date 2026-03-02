import { z } from 'zod';

export const userRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE']);

export const createEmployeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required'),
  role: userRoleSchema,
  branch_id: z
    .union([z.string().uuid('Invalid branch ID'), z.literal('no_branch')])
    .optional(),
  manager_id: z
    .union([z.string().uuid('Invalid manager ID'), z.literal('no_manager')])
    .optional()
    .nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateEmployeeSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  role: userRoleSchema,
  branch_id: z
    .union([z.string().uuid('Invalid branch ID'), z.literal('no_branch')])
    .optional()
    .nullable(),
  manager_id: z
    .union([z.string().uuid('Invalid manager ID'), z.literal('no_manager')])
    .optional()
    .nullable(),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
