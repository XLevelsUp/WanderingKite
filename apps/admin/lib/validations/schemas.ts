import { z } from 'zod';

// Equipment Pricing Plan Validation
export const pricingPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  durationHours: z.number().int().positive('Duration must be positive'),
  rate: z.number().positive('Rate must be positive'),
});

export type PricingPlan = z.infer<typeof pricingPlanSchema>;

// Equipment Validation
export const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  categoryId: z.string().uuid('Category is required'),
  categoryName: z.string().optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid branch').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  specs: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  pricingPlans: z.array(pricingPlanSchema).optional().default([]),
  studioPricingPlans: z.array(pricingPlanSchema).optional().default([]),
  purchaseBill: z.string().url('Invalid URL').optional().or(z.literal('')),
  purchaseDate: z.string().optional().nullable(),
  warrantyDurationMonths: z.number().int().nonnegative().optional().nullable(),
  warrantyExpirationDate: z.string().optional().nullable(),
  serviceCost: z.number().nonnegative().optional().nullable(),
  repairCost: z.number().nonnegative().optional().nullable(),
  isStudioSpace: z.boolean().default(false),
  isRental: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.isRental && (!data.pricingPlans || data.pricingPlans.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pricingPlans'],
      message: 'Provide at least one pricing plan for External Rental',
    });
  }
  if (data.isStudioSpace && (!data.studioPricingPlans || data.studioPricingPlans.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['studioPricingPlans'],
      message: 'Provide at least one pricing plan for Studio Space',
    });
  }
});
export type EquipmentFormData = z.infer<typeof equipmentSchema>;

// Client Validation
// Conversion channels. UNKNOWN is legacy-only — it exists so clients created
// before source tracking was mandatory still satisfy the NOT NULL column, and
// is deliberately excluded from SELECTABLE_CLIENT_SOURCES so it can never be
// picked for a new client.
export const CLIENT_SOURCES = [
  'ADS',
  'GOOGLE',
  'WEBSITE',
  'WALKIN',
  'REFERRAL',
  'AI',
  'SOCIAL_MEDIA',
  'UNKNOWN',
] as const;

export type ClientSource = (typeof CLIENT_SOURCES)[number];

/** Channels an operator may choose in the dashboard picker. */
export const SELECTABLE_CLIENT_SOURCES = CLIENT_SOURCES.filter(
  (s) => s !== 'UNKNOWN'
) as readonly ClientSource[];

/** Sources that require a free-text supplement in source_detail. */
export const SOURCE_REQUIRES_DETAIL: ClientSource = 'SOCIAL_MEDIA';

export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-\(\).]{7,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  govtId: z.string().optional(),
  source: z.enum(CLIENT_SOURCES, {
    message: 'Please select how they found us',
  }),
  sourceDetail: z.string().max(100, 'Details must be under 100 characters').optional(),
}).superRefine((data, ctx) => {
  if (data.source === SOURCE_REQUIRES_DETAIL && !data.sourceDetail?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please specify which social media platform',
      path: ['sourceDetail'],
    });
  }
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
  equipmentIds: z.array(z.string().uuid()).min(1, 'Select at least one equipment item'),
  employeeId: z.string().uuid('Invalid employee ID'),
  clientId: z.string().uuid('Invalid client ID'),
  serviceType: z.enum([
    'wedding', 'engagement', 'birthday', 'family', 'maternity', 'baby_shoot',
    'product', 'cinematic_video', 'social_media', 'model_shoot', 'headshot',
    'ads', 'music_video', 'short_film', 'podcast', 'equipment_rental', 'space_allocation'
  ], { message: 'Select a project type' }),
  assignedAt: z.string().datetime({ message: 'Invalid taken time' }),
  expectedReturn: z
    .string()
    .datetime({ message: 'Invalid return time' }),
  location: z.string().min(1, 'Project location is required').max(255),
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
  shootDate: z
    .string()
    .datetime({ message: 'Provide a valid shoot date/time' }),
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
  type: z.enum([
    'product',
    'cinematic-video',
    'social-media',
    'model-shoot',
    'headshot',
  ]),
  deliverable: z.enum(['still', 'video', 'both']),
  platform: z.enum(['instagram', 'youtube', 'linkedin', 'other']).optional(),
  teleprompter: z.boolean().default(false),
});

// ── Commercial ───────────────────────────────────────────────────────────────
// Music Videos require HSS flash + gimbal; validated at the discriminated level.

const commercialProjectSchema = projectBaseSchema
  .extend({
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
  })
  .superRefine((data, ctx) => {
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
export type PortraitPhotographyFormData = z.infer<
  typeof portraitPhotographySchema
>;
export type CorporateProjectFormData = z.infer<typeof corporateProjectSchema>;
export type CommercialProjectFormData = z.infer<typeof commercialProjectSchema>;
export type StudioFacilitiesFormData = z.infer<typeof studioFacilitiesSchema>;
