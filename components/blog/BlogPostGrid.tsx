'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  CATEGORY_LABELS,
  POSTS_PER_PAGE,
  excerptFrom,
  imageFitClass,
  type BlogCategory,
  type BlogSectionKey,
} from '@/lib/blog';
import { getPublishedPosts } from '@/actions/blog';

export interface BlogCardPost {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  featured_image: string | null;
  featured_image_alt: string | null;
  featured_image_fit: string | null;
  excerpt: string;
  author: string;
  reading_time: number;
  published_at: string;
}

interface BlogPostGridProps {
  /** First page, rendered on the server. */
  posts: BlogCardPost[];
  /** Whether a second page exists — drives the Load more button. */
  initialHasMore: boolean;
  /** Active filters, so Load more requests the same slice. */
  category: string | null;
  tag: string | null;
  /** Which blog these posts belong to. */
  section: BlogSectionKey;
  /** Route prefix for post links, e.g. "/blog" or "/studiospace/blog". */
  basePath: string;
}

export function BlogPostGrid({
  posts,
  initialHasMore,
  category,
  tag,
  section,
  basePath,
}: BlogPostGridProps) {
  const [loaded, setLoaded] = useState<BlogCardPost[]>(posts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  // Re-sync when the server sends a different first page (category or tag
  // changed). useState's initial value is read only on mount, so without this
  // the grid would keep showing the previous filter's results.
  useEffect(() => {
    setLoaded(posts);
    setHasMore(initialHasMore);
  }, [posts, initialHasMore]);

  const loadMore = () => {
    startTransition(async () => {
      const result = await getPublishedPosts({
        section,
        category,
        tag,
        offset: loaded.length,
      });
      // The action returns the raw row; the card wants a plain-text excerpt.
      const mapped: BlogCardPost[] = result.posts.map((post: any) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        category: post.category as BlogCategory,
        featured_image: post.featured_image,
        featured_image_alt: post.featured_image_alt,
        featured_image_fit: post.featured_image_fit,
        excerpt: excerptFrom(post.intro ?? '', 140),
        author: post.author,
        reading_time: post.reading_time,
        published_at: post.published_at,
      }));
      setLoaded((prev) => [...prev, ...mapped]);
      setHasMore(result.hasMore);
    });
  };

  if (loaded.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <ImageIcon className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="text-muted-foreground">No posts here yet.</p>
        <p className="text-sm text-muted-foreground/70">
          Try another category, or check back soon.
        </p>
      </div>
    );
  }

  const shown = loaded;

  return (
    <div className="space-y-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((post, i) => (
          <article
            key={post.id}
            className="group animate-blog-card-in"
            // Staggered entrance, 40ms apart, capped so a full "Load more"
            // batch never waits noticeably. Respects prefers-reduced-motion
            // via the keyframe definition in globals.css.
            style={{ animationDelay: `${Math.min(i % POSTS_PER_PAGE, 8) * 40}ms` }}
          >
            <Link
              href={`${basePath}/${post.slug}`}
              className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative mb-5 aspect-[3/2] overflow-hidden rounded-2xl border border-border/60 bg-card">
                {post.featured_image ? (
                  <>
                    <Image
                      src={post.featured_image}
                      alt={post.featured_image_alt ?? post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`${imageFitClass(post.featured_image_fit)} transition-transform duration-700 ease-out group-hover:scale-[1.04]`}
                    />
                    {/* Bottom scrim so the card reads as one unit and the
                        image never competes with the title below it. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/50">
                    <ImageIcon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Category sits with the content, not on the image. */}
              <div className="mb-2.5 flex items-center gap-2">
                <span className="h-px w-5 bg-amber-500/60" aria-hidden />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500">
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </span>
              </div>

              <h2 className="mb-2 text-xl font-bold leading-snug text-white transition-colors group-hover:text-amber-400">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
                <span className="text-muted-foreground/40" aria-hidden>
                  •
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.reading_time} min read
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isPending}
            className="min-w-[180px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                Load more
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
