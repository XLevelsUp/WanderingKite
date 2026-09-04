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

const BASE_PATH = '/studiospace/blog';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const active = categoryFromSlug(category, 'STUDIO');

  const title = active
    ? `${CATEGORY_LABELS[active]} | Studio Space Coimbatore`
    : 'Studio Journal | Studio Space Coimbatore';

  const description = active
    ? `Articles on ${CATEGORY_LABELS[active].toLowerCase()} from the Studio Space Coimbatore team.`
    : 'Notes on studio production, video, podcasting and content creation from Studio Space Coimbatore.';

  return {
    title,
    description,
    alternates: {
      canonical: active ? `${BASE_PATH}?category=${category}` : BASE_PATH,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: active ? `${BASE_PATH}?category=${category}` : BASE_PATH,
    },
  };
}

export default async function StudioBlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;
  const activeCategory = categoryFromSlug(category, 'STUDIO');

  // Filtering and pagination happen on the server, so the URL is the source
  // of truth and only the first page is sent to the browser.
  const { posts: data, hasMore } = await getPublishedPosts({
    section: 'STUDIO',
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
                THE STUDIO JOURNAL
              </span>
              <h1 className="mx-auto mb-5 max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-white md:text-6xl">
                Studio Notes{' '}
                <span className="text-amber-500">&amp; Guides</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
                Practical writing on studio production, video, podcasting and
                content creation from our space in RS Puram, Coimbatore.
              </p>
            </div>

            <div className="mb-12 space-y-4">
              <BlogCategoryFilter
                active={activeCategory}
                section="STUDIO"
                basePath={BASE_PATH}
              />

              {tag && (
                <p className="text-center text-sm text-muted-foreground">
                  Showing posts tagged{' '}
                  <span className="font-semibold text-amber-400">{tag}</span>
                  {' · '}
                  <Link
                    href={BASE_PATH}
                    className="underline underline-offset-2 hover:text-white"
                  >
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
              section="STUDIO"
              basePath={BASE_PATH}
            />
          </div>
        </section>
      </main>

      <Footer account="studio" />
    </>
  );
}
