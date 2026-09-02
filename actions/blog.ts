'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseSupabaseError } from '@/lib/errorHandler';
import { writeAuditLog } from '@/lib/audit';
import { blogPostSchema, blogCommentSubmitSchema } from '@/lib/validations/blog';
import {
  BLOG_EDITOR_ROLES,
  POSTS_PER_PAGE,
  estimateReadingTime,
  type BlogCommentStatus,
} from '@/lib/blog';

/**
 * Blog authoring is open to staff plus the MARKETING role — a sideways role
 * that reaches the blog and nothing else (see ROLE_ROUTE_ALLOWLIST in
 * lib/access.ts). RLS enforces the same list; this is the app-layer guard.
 */
async function requireBlogEditor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? '';
  if (!(BLOG_EDITOR_ROLES as readonly string[]).includes(role)) {
    throw new Error('Insufficient permissions');
  }
  return { supabase, user };
}

/**
 * Revalidate every surface a post appears on. Both listings are refreshed
 * regardless of section — a post can move between them on edit, which would
 * otherwise leave it stale on the blog it left.
 */
function revalidateBlog(slug?: string) {
  revalidatePath('/dashboard/blog');
  revalidatePath('/blog');
  revalidatePath('/studiospace/blog');
  if (slug) {
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/studiospace/blog/${slug}`);
  }
}

// ── Reads ────────────────────────────────────────────────────────────────────

/** Admin list — every post regardless of section. */
export async function getBlogPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

/**
 * Full post with every child block, ordered. Used by both the admin edit form
 * and the public detail page.
 */
export async function getBlogPostBySlug(slug: string, section?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('blog_posts')
    .select(
      `*,
       blog_sections(*, blog_subsections(*)),
       blog_qa(*),
       blog_cta(*, blog_cta_buttons(*))`
    )
    .eq('slug', slug);

  // Scoped so a photography slug 404s under /studiospace/blog rather than
  // rendering the wrong blog's post at the wrong URL.
  if (section) query = query.eq('section', section);

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;
  return sortPostChildren(data);
}

export async function getBlogPostById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      `*,
       blog_sections(*, blog_subsections(*)),
       blog_qa(*),
       blog_cta(*, blog_cta_buttons(*))`
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return sortPostChildren(data);
}

/**
 * Supabase returns nested rows unordered, so sort_order is applied here rather
 * than relying on insertion order.
 */
function sortPostChildren(post: any) {
  const sections = [...(post.blog_sections ?? [])]
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((s: any) => ({
      ...s,
      blog_subsections: [...(s.blog_subsections ?? [])].sort(
        (a: any, b: any) => a.sort_order - b.sort_order
      ),
    }));

  const qa = [...(post.blog_qa ?? [])].sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  const cta = post.blog_cta
    ? {
        ...post.blog_cta,
        blog_cta_buttons: [...(post.blog_cta.blog_cta_buttons ?? [])].sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      }
    : null;

  return { ...post, blog_sections: sections, blog_qa: qa, blog_cta: cta };
}

// ── Writes ───────────────────────────────────────────────────────────────────

/**
 * Replace all child blocks for a post. Children cascade on delete, so the
 * simplest correct approach is delete-then-reinsert rather than diffing —
 * posts are small and saved infrequently.
 */
async function writeChildren(
  supabase: any,
  postId: string,
  data: ReturnType<typeof blogPostSchema.parse>
) {
  await supabase.from('blog_sections').delete().eq('post_id', postId);
  await supabase.from('blog_qa').delete().eq('post_id', postId);
  await supabase.from('blog_cta').delete().eq('post_id', postId);

  for (const [i, section] of data.sections.entries()) {
    const { data: inserted, error } = await supabase
      .from('blog_sections')
      .insert({
        post_id: postId,
        heading: section.heading,
        body: section.body,
        body_type: section.bodyType,
        image: section.image || null,
        image_alt: section.imageAlt || null,
        image_fit: section.imageFit,
        sort_order: i,
      })
      .select('id')
      .single();

    if (error) throw new Error(parseSupabaseError(error, 'Failed to save section'));

    if (section.subsections.length > 0) {
      const { error: subError } = await supabase.from('blog_subsections').insert(
        section.subsections.map((sub, j) => ({
          section_id: inserted.id,
          heading: sub.heading,
          body: sub.body,
          body_type: sub.bodyType,
          sort_order: j,
        }))
      );
      if (subError) {
        throw new Error(parseSupabaseError(subError, 'Failed to save sub-section'));
      }
    }
  }

  if (data.qa.length > 0) {
    const { error } = await supabase.from('blog_qa').insert(
      data.qa.map((item, i) => ({
        post_id: postId,
        question: item.question,
        answer: item.answer,
        sort_order: i,
      }))
    );
    if (error) throw new Error(parseSupabaseError(error, 'Failed to save Q&A'));
  }

  if (data.cta && (data.cta.heading || data.cta.body || data.cta.buttons.length > 0)) {
    const { data: ctaRow, error } = await supabase
      .from('blog_cta')
      .insert({
        post_id: postId,
        heading: data.cta.heading,
        body: data.cta.body,
      })
      .select('id')
      .single();

    if (error) throw new Error(parseSupabaseError(error, 'Failed to save CTA'));

    if (data.cta.buttons.length > 0) {
      const { error: btnError } = await supabase.from('blog_cta_buttons').insert(
        data.cta.buttons.map((b, i) => ({
          cta_id: ctaRow.id,
          label: b.label,
          href: b.href,
          sort_order: i,
        }))
      );
      if (btnError) {
        throw new Error(parseSupabaseError(btnError, 'Failed to save CTA button'));
      }
    }
  }
}

/** Reading time is auto-estimated unless the author set it explicitly. */
function resolveReadingTime(data: ReturnType<typeof blogPostSchema.parse>): number {
  if (data.readingTime > 0) return data.readingTime;
  return estimateReadingTime(
    data.intro,
    ...data.sections.flatMap((s) => [s.body, ...s.subsections.map((sub) => sub.body)]),
    ...data.qa.map((q) => q.answer)
  );
}

export async function createBlogPost(input: unknown) {
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid post data.' };
  }
  const data = parsed.data;

  try {
    const { supabase, user } = await requireBlogEditor();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        slug: data.slug,
        title: data.title,
        section: data.section,
        category: data.category,
        featured_image: data.featuredImage || null,
        featured_image_alt: data.featuredImageAlt || null,
        featured_image_fit: data.featuredImageFit,
        intro: data.intro,
        author: data.author,
        tags: data.tags,
        reading_time: resolveReadingTime(data),
        published_at: data.publishedAt,
        meta_title: data.metaTitle || null,
        meta_description: data.metaDescription || null,
      })
      .select('id, slug')
      .single();

    if (error) {
      return { error: parseSupabaseError(error, 'Failed to create post.') };
    }

    await writeChildren(supabase, post.id, data);

    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'CREATE_BLOG_POST',
      table_name: 'blog_posts',
      record_id: post.id,
      new_data: { slug: post.slug, title: data.title },
    });

    revalidateBlog(post.slug);
    return { success: true, id: post.id, slug: post.slug };
  } catch (err: any) {
    return { error: err?.message || 'Failed to create post.' };
  }
}

export async function updateBlogPost(id: string, input: unknown) {
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid post data.' };
  }
  const data = parsed.data;

  try {
    const { supabase, user } = await requireBlogEditor();

    const { data: oldRow } = await supabase
      .from('blog_posts')
      .select('slug, title')
      .eq('id', id)
      .single();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .update({
        slug: data.slug,
        title: data.title,
        section: data.section,
        category: data.category,
        featured_image: data.featuredImage || null,
        featured_image_alt: data.featuredImageAlt || null,
        featured_image_fit: data.featuredImageFit,
        intro: data.intro,
        author: data.author,
        tags: data.tags,
        reading_time: resolveReadingTime(data),
        published_at: data.publishedAt,
        meta_title: data.metaTitle || null,
        meta_description: data.metaDescription || null,
      })
      .eq('id', id)
      .select('id, slug')
      .single();

    if (error) {
      return { error: parseSupabaseError(error, 'Failed to update post.') };
    }

    await writeChildren(supabase, id, data);

    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'UPDATE_BLOG_POST',
      table_name: 'blog_posts',
      record_id: id,
      old_data: oldRow,
      new_data: { slug: post.slug, title: data.title },
    });

    // The slug may have changed — revalidate both paths.
    revalidateBlog(post.slug);
    if (oldRow?.slug && oldRow.slug !== post.slug) {
      revalidatePath(`/blog/${oldRow.slug}`);
    }
    return { success: true, id: post.id, slug: post.slug };
  } catch (err: any) {
    return { error: err?.message || 'Failed to update post.' };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const { supabase, user } = await requireBlogEditor();

    const { data: oldRow } = await supabase
      .from('blog_posts')
      .select('slug, title')
      .eq('id', id)
      .single();

    // Sections, Q&A, CTA and comments all cascade from blog_posts.
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      return { error: parseSupabaseError(error, 'Failed to delete post.') };
    }

    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'DELETE_BLOG_POST',
      table_name: 'blog_posts',
      record_id: id,
      old_data: oldRow,
    });

    revalidateBlog(oldRow?.slug);
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete post.' };
  }
}

/**
 * A page of published posts for the public listing.
 *
 * Paginated at the database level rather than sending every post to the
 * browser: "Load more" calls this for the next slice, so a site with hundreds
 * of posts still transfers only what is on screen. Returns `hasMore` so the
 * button can hide itself without a separate count query.
 */
export async function getPublishedPosts({
  section = 'PHOTOGRAPHY',
  category,
  tag,
  offset = 0,
  limit = POSTS_PER_PAGE,
}: {
  section?: string;
  category?: string | null;
  tag?: string | null;
  offset?: number;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('blog_posts')
    .select(
      'id, slug, title, category, featured_image, featured_image_alt, featured_image_fit, intro, author, reading_time, published_at'
    )
    .eq('section', section)
    .order('published_at', { ascending: false })
    // Fetch one extra row to detect whether another page exists.
    .range(offset, offset + limit);

  if (category) query = query.eq('category', category);
  if (tag) query = query.contains('tags', [tag]);

  const { data, error } = await query;
  if (error || !data) return { posts: [], hasMore: false };

  const hasMore = data.length > limit;
  return { posts: hasMore ? data.slice(0, limit) : data, hasMore };
}

/**
 * Approved comments for a post, for the public detail page. The RLS SELECT
 * policy already restricts anonymous readers to APPROVED rows; the explicit
 * filter here means a logged-in moderator browsing the public page sees the
 * same thing a visitor does, rather than their own moderation view.
 */
export async function getApprovedComments(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_comments')
    .select('id, author_name, body, created_at')
    .eq('post_id', postId)
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

// ── Public comment submission ────────────────────────────────────────────────

/**
 * Submit a comment from the public post page.
 *
 * Deliberately unauthenticated — anyone reading a post may comment. Three
 * things keep that safe:
 *   1. blogCommentSubmitSchema has no status field, so a caller cannot even
 *      express "approved".
 *   2. status is hardcoded to PENDING here.
 *   3. The RLS INSERT policy pins status = 'PENDING', so a forged request
 *      that bypasses this action still cannot self-approve.
 * Nothing is publicly readable until a moderator approves it.
 */
export async function submitBlogComment(input: unknown) {
  const parsed = blogCommentSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid comment.' };
  }
  const data = parsed.data;

  const supabase = await createClient();

  // Confirm the post exists — a bad post_id would otherwise fail on the FK
  // with an opaque database error.
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, slug')
    .eq('id', data.postId)
    .maybeSingle();

  if (!post) {
    return { error: 'That post no longer exists.' };
  }

  const { error } = await supabase.from('blog_comments').insert({
    post_id: data.postId,
    author_name: data.authorName,
    author_email: data.authorEmail || null,
    body: data.body,
    status: 'PENDING',
  });

  if (error) {
    return { error: parseSupabaseError(error, 'Failed to submit comment.') };
  }

  revalidatePath('/dashboard/blog/comments');
  return {
    success: true,
    message: 'Thanks — your comment has been submitted.',
  };
}

// ── Comment moderation ───────────────────────────────────────────────────────

export async function getBlogComments(status?: BlogCommentStatus) {
  const { supabase } = await requireBlogEditor();

  let query = supabase
    .from('blog_comments')
    .select('*, blog_posts(title, slug)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function setBlogCommentStatus(id: string, status: BlogCommentStatus) {
  try {
    const { supabase, user } = await requireBlogEditor();

    const { data: oldRow } = await supabase
      .from('blog_comments')
      .select('status, post_id, blog_posts(slug)')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('blog_comments')
      .update({ status })
      .eq('id', id);

    if (error) {
      return { error: parseSupabaseError(error, 'Failed to update comment.') };
    }

    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'MODERATE_BLOG_COMMENT',
      table_name: 'blog_comments',
      record_id: id,
      old_data: { status: oldRow?.status },
      new_data: { status },
    });

    revalidatePath('/dashboard/blog/comments');
    const slug = (oldRow as any)?.blog_posts?.slug;
    if (slug) revalidatePath(`/blog/${slug}`);
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to update comment.' };
  }
}

export async function deleteBlogComment(id: string) {
  try {
    const { supabase, user } = await requireBlogEditor();

    const { error } = await supabase.from('blog_comments').delete().eq('id', id);
    if (error) {
      return { error: parseSupabaseError(error, 'Failed to delete comment.') };
    }

    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'DELETE_BLOG_COMMENT',
      table_name: 'blog_comments',
      record_id: id,
    });

    revalidatePath('/dashboard/blog/comments');
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete comment.' };
  }
}
