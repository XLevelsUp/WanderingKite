import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts } from '@/actions/blog-public';
import { Footer } from '@/components/shared/Footer';
import { BlogCategoryFilter } from '@/components/blog/BlogCategoryFilter';
import { BlogPostGrid, type BlogCardPost } from '@/components/blog/BlogPostGrid';
import {
  CATEGORY_LABELS,
  categoryFromSlug,
  excerptFrom,
  type BlogCategory,
} from '@/lib/blog';

export const dynamic = 'force-dynamic';

const WRAP = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const active = categoryFromSlug(category);

  const title = active
    ? `${CATEGORY_LABELS[active]} | Wandering Kite Blog`
    : 'Photography Blog | Wandering Kite Coimbatore';

  const description = active
    ? `Articles on ${CATEGORY_LABELS[active].toLowerCase()} from the Wandering Kite Photography team in Coimbatore.`
    : 'Stories, tips and insights on wedding, portrait, commercial and event photography from Wandering Kite in Coimbatore.';

  return {
    title,
    description,
    alternates: {
      canonical: active ? `/blog?category=${category}` : '/blog',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: active ? `/blog?category=${category}` : '/blog',
    },
  };
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;
  const activeCategory = categoryFromSlug(category);

  // Filtering and pagination happen on the server, so the URL is the source
  // of truth and only the first page is sent to the browser.
  const { posts: data, hasMore } = await getPublishedPosts({
    category: activeCategory,
    tag,
  });

  const posts: BlogCardPost[] = (data ?? []).map((post: any) => ({
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

  return (
    <>
      <main className="min-h-screen pt-28 sm:pt-32">
        <section className="pb-16 sm:pb-20">
          <div className={WRAP}>
            {/* Header */}
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="mb-5 inline-block rounded-full border border-border bg-card px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-text">
                The Journal
              </span>
              <h1 className="mx-auto mb-5 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                Photography Stories{' '}
                <span className="text-accent-text">&amp; Insights</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
                Notes on visual storytelling, wedding and portrait work, and
                commercial photography from our team in Coimbatore.
              </p>
            </div>

            {/* Category filter + tag indicator */}
            <div className="mb-12 space-y-4">
              <BlogCategoryFilter active={activeCategory} section="PHOTOGRAPHY" basePath="/blog" />

              {tag && (
                <p className="text-center text-sm text-foreground/70">
                  Showing posts tagged{' '}
                  <span className="font-semibold text-accent-text">{tag}</span>
                  {' · '}
                  <Link href="/blog" className="underline underline-offset-2 hover:text-foreground">
                    clear
                  </Link>
                </p>
              )}
            </div>

            {/* Post grid */}
            <BlogPostGrid
              posts={posts}
              initialHasMore={hasMore}
              category={activeCategory}
              tag={tag ?? null}
              section="PHOTOGRAPHY"
              basePath="/blog"
            />
          </div>
        </section>
      </main>

      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}
