import { z } from 'zod';

// Equipment Validation
export const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  categoryId: z.string().uuid('Invalid category').optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid branch').optional().or(z.literal('')),
  rentalPrice: z.number().positive('Price must be positive'),
  weeklyPrice: z.number().min(0).default(0),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  specs: z.string().optional().nullable(),
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

// ─────────────────────────────────────────────────────────────────────────────
// Project Category Schemas (Studio ERP — Service Taxonomy)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared base fields present on every project submission form.
 */
const projectBaseSchema = z.object({
  clientId: z.string().uuid('Select a valid client'),
  title: z.string().min(2, 'Project title must be at least 2 characters'),
  shootDate: z.string().datetime({ message: 'Provide a valid shoot date/time' }),
  notes: z.string().max(2000).optional(),
});

// ── Photography — Events ─────────────────────────────────────────────────────

const eventPhotographySchema = projectBaseSchema.extend({
  domain: z.literal('photography'),
  subDomain: z.literal('events'),
  type: z.enum(['wedding', 'engagement', 'birthday']),
  durationHours: z.number().int().min(1).max(24),
  locationCount: z.number().int().min(1).max(10),
  hssFlash: z.boolean().default(false),
  secondShooterKit: z.string().uuid().optional(),
});

// ── Photography — Portraits ──────────────────────────────────────────────────

const portraitPhotographySchema = projectBaseSchema.extend({
  domain: z.literal('photography'),
  subDomain: z.literal('portraits'),
  type: z.enum(['family', 'maternity', 'baby-shoot']),
  sessionType: z.enum(['studio', 'outdoor', 'hybrid']),
  backdrop: z.enum(['white', 'black', 'grey', 'custom']).default('white'),
});

// ── Corporate ────────────────────────────────────────────────────────────────

const corporateProjectSchema = projectBaseSchema.extend({
  domain: z.literal('corporate'),
  type: z.enum(['product', 'cinematic-video', 'social-media', 'model-shoot', 'headshot']),
  deliverable: z.enum(['still', 'video', 'both']),
  platform: z.enum(['instagram', 'youtube', 'linkedin', 'other']).optional(),
  teleprompter: z.boolean().default(false),
});

// ── Commercial ───────────────────────────────────────────────────────────────
// Music Videos require HSS flash + gimbal; validated at the discriminated level.

const commercialProjectSchema = projectBaseSchema.extend({
  domain: z.literal('commercial'),
  type: z.enum(['ads', 'music-video', 'short-film']),
  productionDays: z.number().int().min(1),
  postProduction: z.boolean().default(false),
  /** HSS flash — required for music-video and ads */
  hssFlash: z.boolean(),
  /** Motorised gimbal — required for music-video and short-film */
  gimbal: z.boolean(),
  drone: z.boolean().default(false),
  slider: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.type === 'music-video') {
    if (!data.hssFlash) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hssFlash'],
        message: 'Music Videos require High-Speed Sync flash in the kit',
      });
    }
    if (!data.gimbal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gimbal'],
        message: 'Music Videos require a motorised gimbal in the kit',
      });
    }
  }
  if (data.type === 'short-film' && !data.gimbal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['gimbal'],
      message: 'Short Films require a gimbal for cinematic movement',
    });
  }
});

// ── Studio Facilities ─────────────────────────────────────────────────────────

const studioFacilitiesSchema = projectBaseSchema.extend({
  domain: z.literal('studio-facilities'),
  type: z.enum(['podcast', 'equipment-rental', 'space-allocation']),
  durationHours: z.number().int().min(1).max(12),
  resourceIds: z.array(z.string()).min(0),
  videoPodcastRig: z.boolean().default(false),
});

// ── Top-level discriminated union ────────────────────────────────────────────
// Zod discriminated unions with a two-level discriminant require nesting.
// We discriminate first on `domain`, then sub-schemas handle `subDomain`/`type`.

export const projectCategorySchema = z.discriminatedUnion('domain', [
  // Photography re-discriminated on subDomain internally
  eventPhotographySchema,
  portraitPhotographySchema,
  corporateProjectSchema,
  commercialProjectSchema,
  studioFacilitiesSchema,
]);

export type ProjectFormData = z.infer<typeof projectCategorySchema>;

// Convenience sub-type exports
export type EventPhotographyFormData = z.infer<typeof eventPhotographySchema>;
export type PortraitPhotographyFormData = z.infer<typeof portraitPhotographySchema>;
export type CorporateProjectFormData = z.infer<typeof corporateProjectSchema>;
export type CommercialProjectFormData = z.infer<typeof commercialProjectSchema>;
export type StudioFacilitiesFormData = z.infer<typeof studioFacilitiesSchema>;
