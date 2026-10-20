import { z } from 'zod';
import {
  BLOG_BODY_TYPES,
  BLOG_CATEGORIES,
  BLOG_SECTIONS,
  BLOG_COMMENT_STATUSES,
  BLOG_IMAGE_FITS,
} from '@/lib/blog';

// ── Building blocks ──────────────────────────────────────────────────────────

export const blogSubsectionSchema = z.object({
  id: z.string().uuid().optional(),
  heading: z.string().min(1, 'Sub-section heading is required').max(200),
  body: z.string().default(''),
  bodyType: z.enum(BLOG_BODY_TYPES).default('RICH_TEXT'),
  sortOrder: z.number().int().min(0).default(0),
});

export const blogSectionSchema = z.object({
  id: z.string().uuid().optional(),
  heading: z.string().min(1, 'Section heading is required').max(200),
  body: z.string().default(''),
  bodyType: z.enum(BLOG_BODY_TYPES).default('RICH_TEXT'),
  // Optional, and always rendered after the body — images cannot sit
  // mid-paragraph by design.
  image: z.string().optional().or(z.literal('')),
  imageAlt: z.string().max(200).optional().or(z.literal('')),
  imageFit: z.enum(BLOG_IMAGE_FITS).default('COVER'),
  sortOrder: z.number().int().min(0).default(0),
  subsections: z.array(blogSubsectionSchema).default([]),
});

export const blogQaSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1, 'Question is required').max(300),
  answer: z.string().default(''),
  sortOrder: z.number().int().min(0).default(0),
});

export const blogCtaButtonSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1, 'Button label is required').max(80),
  href: z.string().min(1, 'Button link is required').max(300),
  sortOrder: z.number().int().min(0).default(0),
});

export const blogCtaSchema = z.object({
  heading: z.string().max(200).default(''),
  body: z.string().default(''),
  buttons: z.array(blogCtaButtonSchema).default([]),
});

// ── Post ─────────────────────────────────────────────────────────────────────

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug may contain lowercase letters, numbers and single hyphens only'
    ),
  title: z.string().min(1, 'Title is required').max(200),
  section: z.enum(BLOG_SECTIONS).default('PHOTOGRAPHY'),
  category: z.enum(BLOG_CATEGORIES, {
    message: 'Please choose a category',
  }),

  featuredImage: z.string().optional().or(z.literal('')),
  featuredImageAlt: z.string().max(200).optional().or(z.literal('')),
  featuredImageFit: z.enum(BLOG_IMAGE_FITS).default('COVER'),

  intro: z.string().default(''),
  author: z.string().min(1, 'Author is required').max(120),
  tags: z.array(z.string().min(1).max(60)).default([]),

  readingTime: z
    .number({ message: 'Reading time must be a number' })
    .int()
    .min(1, 'Reading time must be at least 1 minute')
    .max(120),

  publishedAt: z.string().min(1, 'Publish date is required'),

  metaTitle: z.string().max(200).optional().or(z.literal('')),
  metaDescription: z.string().max(300).optional().or(z.literal('')),

  sections: z.array(blogSectionSchema).default([]),
  qa: z.array(blogQaSchema).default([]),
  cta: blogCtaSchema.optional(),
}).superRefine((data, ctx) => {
  // A featured image without alt text is an accessibility hole, and the image
  // is used in both the listing card and the detail hero.
  if (data.featuredImage && !data.featuredImageAlt?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Alt text is required when a featured image is set',
      path: ['featuredImageAlt'],
    });
  }
  data.sections.forEach((section, i) => {
    if (section.image && !section.imageAlt?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Alt text is required when a section image is set',
        path: ['sections', i, 'imageAlt'],
      });
    }
  });
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
export type BlogSectionFormData = z.infer<typeof blogSectionSchema>;
export type BlogSubsectionFormData = z.infer<typeof blogSubsectionSchema>;
export type BlogQaFormData = z.infer<typeof blogQaSchema>;
export type BlogCtaFormData = z.infer<typeof blogCtaSchema>;

// ── Comments ─────────────────────────────────────────────────────────────────

/**
 * What a visitor may submit. Deliberately has NO status field — the status is
 * set server-side to PENDING and pinned by an RLS check, so a client cannot
 * self-approve.
 */
export const blogCommentSubmitSchema = z.object({
  postId: z.string().uuid(),
  authorName: z.string().min(1, 'Name is required').max(120),
  authorEmail: z
    .string()
    .email('Please enter a valid email address')
    .max(200)
    .optional()
    .or(z.literal('')),
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be under 2000 characters'),
});

export type BlogCommentSubmitData = z.infer<typeof blogCommentSubmitSchema>;

export const blogCommentModerationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(BLOG_COMMENT_STATUSES),
});
