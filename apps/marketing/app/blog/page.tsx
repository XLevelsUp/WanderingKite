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
      <main className="min-h-screen pt-32">
        <section className="pb-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto mb-14 text-center">
              <span className="mb-5 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-amber-400">
                THE JOURNAL
              </span>
              {/* max-w-3xl keeps the headline near the 60-75 character measure
                  that stays readable on wide screens. */}
              <h1 className="mx-auto mb-5 max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-white md:text-6xl">
                Photography Stories{' '}
                <span className="text-amber-500">&amp; Insights</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
                Notes on visual storytelling, wedding and portrait work, and
                commercial photography from our team in Coimbatore.
              </p>
            </div>

            <div className="mb-12 space-y-4">
              <BlogCategoryFilter active={activeCategory} section="PHOTOGRAPHY" basePath="/blog" />

              {tag && (
                <p className="text-center text-sm text-muted-foreground">
                  Showing posts tagged{' '}
                  <span className="font-semibold text-amber-400">{tag}</span>
                  {' · '}
                  <Link href="/blog" className="underline underline-offset-2 hover:text-white">
                    clear
                  </Link>
                </p>
              )}
            </div>

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

      <Footer />
    </>
  );
}
