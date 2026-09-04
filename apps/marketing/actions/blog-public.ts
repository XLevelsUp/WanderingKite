'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseSupabaseError } from '@/lib/errorHandler';
import { blogCommentSubmitSchema } from '@/lib/validations/blog';
import { POSTS_PER_PAGE } from '@/lib/blog';

// ── Reads ────────────────────────────────────────────────────────────────────

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
