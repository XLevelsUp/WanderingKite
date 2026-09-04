/**
 * Blog domain constants and helpers.
 *
 * Pure — no React, no server-only imports. Safe in both Server and Client
 * Components. Mirrors the enums defined in 00066_blog_system.sql.
 */

export const BLOG_SECTIONS = ['PHOTOGRAPHY', 'STUDIO'] as const;
export type BlogSectionKey = (typeof BLOG_SECTIONS)[number];

/** Categories for the /blog (photography) section. */
export const PHOTOGRAPHY_CATEGORIES = [
  'WEDDING_EVENT',
  'PORTRAITS_LIFESTYLE',
  'COMMERCIAL_BRAND',
  'TIPS_INSIGHTS',
] as const;

/** Categories for the /studiospace/blog section. */
export const STUDIO_CATEGORIES = [
  'STUDIO_SPACE',
  'STUDIO_PHOTOGRAPHY',
  'VIDEO_PRODUCTION',
  'CONTENT_CREATION',
  'PODCAST_AUDIO',
  'EQUIPMENT_TECHNIQUES',
] as const;

export const BLOG_CATEGORIES = [
  ...PHOTOGRAPHY_CATEGORIES,
  ...STUDIO_CATEGORIES,
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  // Photography blog
  WEDDING_EVENT: 'Wedding & Event Photography',
  PORTRAITS_LIFESTYLE: 'Portraits & Lifestyle',
  COMMERCIAL_BRAND: 'Commercial & Brand Photography',
  TIPS_INSIGHTS: 'Photography Tips & Insights',
  // Studio blog
  STUDIO_SPACE: 'Studio Space',
  STUDIO_PHOTOGRAPHY: 'Photography',
  VIDEO_PRODUCTION: 'Video Production',
  CONTENT_CREATION: 'Content Creation',
  PODCAST_AUDIO: 'Podcast & Audio',
  EQUIPMENT_TECHNIQUES: 'Equipment & Techniques',
};

/** URL-facing category slugs, used by the ?category= filter on the listing. */
export const CATEGORY_SLUGS: Record<BlogCategory, string> = {
  WEDDING_EVENT: 'wedding-event',
  PORTRAITS_LIFESTYLE: 'portraits-lifestyle',
  COMMERCIAL_BRAND: 'commercial-brand',
  TIPS_INSIGHTS: 'tips-insights',
  STUDIO_SPACE: 'studio-space',
  STUDIO_PHOTOGRAPHY: 'photography',
  VIDEO_PRODUCTION: 'video-production',
  CONTENT_CREATION: 'content-creation',
  PODCAST_AUDIO: 'podcast-audio',
  EQUIPMENT_TECHNIQUES: 'equipment-techniques',
};

/** The category list a given blog section may choose from. */
export function categoriesForSection(
  section: BlogSectionKey
): readonly BlogCategory[] {
  return section === 'STUDIO' ? STUDIO_CATEGORIES : PHOTOGRAPHY_CATEGORIES;
}

/**
 * Resolve a URL slug to a category. Scoped by section because the two blogs
 * are independent lists — without it, a /studiospace/blog?category=… could
 * match a photography-only category.
 */
export function categoryFromSlug(
  slug: string | undefined,
  section: BlogSectionKey = 'PHOTOGRAPHY'
): BlogCategory | null {
  if (!slug) return null;
  const match = categoriesForSection(section).find(
    (key) => CATEGORY_SLUGS[key] === slug
  );
  return match ?? null;
}

/** How a section or sub-section body renders. */
export const BLOG_BODY_TYPES = ['RICH_TEXT', 'ORDERED_LIST', 'BULLET_LIST'] as const;
export type BlogBodyType = (typeof BLOG_BODY_TYPES)[number];

export const BODY_TYPE_LABELS: Record<BlogBodyType, string> = {
  RICH_TEXT: 'Paragraphs',
  ORDERED_LIST: 'Numbered steps',
  BULLET_LIST: 'Bulleted list',
};

/** How an image sits in its frame. */
export const BLOG_IMAGE_FITS = ['COVER', 'CONTAIN'] as const;
export type BlogImageFit = (typeof BLOG_IMAGE_FITS)[number];

export const IMAGE_FIT_LABELS: Record<BlogImageFit, string> = {
  COVER: 'Fill frame (crops edges)',
  CONTAIN: 'Fit whole image (adds letterboxing)',
};

/** Tailwind class for a stored fit value. */
export function imageFitClass(fit: string | null | undefined): string {
  return fit === 'CONTAIN' ? 'object-contain' : 'object-cover';
}

export const BLOG_COMMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type BlogCommentStatus = (typeof BLOG_COMMENT_STATUSES)[number];

/** Posts per page on the public listing ("Load More" increment). */
export const POSTS_PER_PAGE = 9;

/**
 * Turn a title into a URL slug. Used to prefill the slug field; the author
 * can still override it, and uniqueness is enforced by the database.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Strip HTML tags so rich-text bodies can be counted and excerpted. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Average adult reading speed, words per minute. */
const WORDS_PER_MINUTE = 200;

/**
 * Estimate reading time in minutes from the post's full text. Always at least
 * 1. The author can override the stored value.
 */
export function estimateReadingTime(...htmlChunks: (string | null | undefined)[]): number {
  const words = htmlChunks
    .filter(Boolean)
    .map((chunk) => stripHtml(chunk as string))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * Meta description fallback: an excerpt of the intro, used when the author
 * has not written one.
 */
export function excerptFrom(html: string, maxLength = 155): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

/** Roles permitted to author and moderate blog content. */
export const BLOG_EDITOR_ROLES = [
  'ADMIN',
  'SUPER_ADMIN',
  'DEVELOPER',
  'MARKETING',
] as const;
