import { z } from 'zod';

export const storageDeviceTypeSchema = z.enum(['HDD', 'SSD', 'CLOUD']);

export const mediaRecordStatusSchema = z.enum([
  'NOT_STARTED',
  'EDITING',
  'REVIEW',
  'PRODUCTION_READY',
  'DELIVERED',
]);

export const storageDeviceSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(255),
  type: storageDeviceTypeSchema,
  capacity: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export type StorageDeviceFormData = z.infer<typeof storageDeviceSchema>;

const optionalUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined));

export const mediaRecordSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  clientId: z.string().uuid('Select a client'),
  photographyBookingId: optionalUuid,
  studioBookingId: optionalUuid,
  shootDate: z.string().optional().or(z.literal('')),
  primaryStorageDeviceId: optionalUuid,
  originalBackupDeviceId: optionalUuid,
  backupCopyDeviceId: optionalUuid,
  assignedEmployeeId: optionalUuid,
  status: mediaRecordStatusSchema,
  photoCount: z.number().int().min(0).default(0),
  videoCount: z.number().int().min(0).default(0),
  photoSizeGb: z.number().min(0).default(0),
  videoSizeGb: z.number().min(0).default(0),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type MediaRecordFormData = z.infer<typeof mediaRecordSchema>;
