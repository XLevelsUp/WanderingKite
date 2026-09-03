import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, MessageSquare, User } from 'lucide-react';

import { Footer } from '@/components/shared/Footer';
import { brandSocials } from '@/lib/socials';
import { JsonLd } from '@/lib/schema-helpers';
import { BlogBody } from '@/components/blog/BlogBody';
import { BlogShareButton } from '@/components/blog/BlogShareButton';
import { CommentSection } from '@/components/blog/CommentSection';
import { getBlogPostBySlug, getApprovedComments } from '@/actions/blog';
import {
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  excerptFrom,
  imageFitClass,
  type BlogCategory,
} from '@/lib/blog';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://wanderingkite.in';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, 'PHOTOGRAPHY');

  if (!post) {
    return { title: 'Post not found | Wandering Kite' };
  }

  // Author-supplied meta wins; otherwise fall back to the title and an
  // excerpt of the introduction.
  const title = post.meta_title || post.title;
  const description = post.meta_description || excerptFrom(post.intro ?? '', 155);

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at,
      authors: [post.author],
      images: post.featured_image ? [{ url: post.featured_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, 'PHOTOGRAPHY');
  if (!post) notFound();

  const comments = await getApprovedComments(post.id);

  const description =
    post.meta_description || excerptFrom(post.intro ?? '', 155);

  const structuredData: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/${post.slug}#article`,
      headline: post.title,
      description,
      image: post.featured_image ? [post.featured_image] : undefined,
      datePublished: post.published_at,
      dateModified: post.updated_at ?? post.published_at,
      author: { '@type': 'Organization', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'Wandering Kite Studio',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.slug}`,
      },
      keywords: (post.tags ?? []).join(', '),
      articleSection: CATEGORY_LABELS[post.category as BlogCategory],
    },
  ];

  // Q&A pairs map cleanly onto FAQPage, which can earn a rich result.
  if ((post.blog_qa ?? []).length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.blog_qa.map((item: any) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer?.replace(/<[^>]*>/g, '') ?? '',
        },
      })),
    });
  }

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen pt-32">
        <article>
          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <div className="container mx-auto px-6">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              All posts
            </Link>

            <div className="mb-8">
              <Link
                href={`/blog?category=${CATEGORY_SLUGS[post.category as BlogCategory]}`}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-400 transition-colors hover:border-amber-500/60 hover:text-amber-300"
              >
                {CATEGORY_LABELS[post.category as BlogCategory] ?? post.category}
              </Link>
              {/* max-w-4xl holds the title to a readable measure on desktop. */}
              <h1 className="max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight text-white md:text-5xl">
                {post.title}
              </h1>
            </div>

            {post.featured_image && (
              <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-3xl bg-card">
                <Image
                  src={post.featured_image}
                  alt={post.featured_image_alt ?? post.title}
                  fill
                  priority
                  sizes="100vw"
                  className={imageFitClass(post.featured_image_fit)}
                />
              </div>
            )}
          </div>

          {/* ── Body + sidebar ────────────────────────────────────────────── */}
          <div className="container mx-auto px-6 pb-20">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <BlogBody
                  intro={post.intro}
                  sections={post.blog_sections ?? []}
                  qa={post.blog_qa ?? []}
                  cta={post.blog_cta}
                />

                <div className="mt-16 border-t border-border pt-12">
                  <CommentSection postId={post.id} comments={comments} />
                </div>
              </div>

              {/* self-start is required: a grid item stretches by default,
                  which leaves position:sticky nothing to float within. */}
              <aside className="lg:col-span-4 lg:self-start lg:sticky lg:top-28">
                <div className="space-y-6 rounded-2xl border border-border bg-card/40 p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 text-amber-500" />
                      <span className="text-white">{post.author}</span>
                    </div>
                    <div className="text-muted-foreground">
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-amber-500" />
                      {post.reading_time} min read
                    </div>
                  </div>

                  {(post.tags ?? []).length > 0 && (
                    <div className="border-t border-border pt-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag: string) => (
                          <Link
                            key={tag}
                            href={`/blog?tag=${encodeURIComponent(tag)}`}
                            className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-white"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 border-t border-border pt-4">
                    <a
                      href="#comments"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-white"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {comments.length} comment{comments.length === 1 ? '' : 's'}
                    </a>
                    <BlogShareButton title={post.title} />
                  </div>

                  {/* Same profiles as the footer — brandSocials is exported
                      from Footer.tsx so the URLs live in one place. */}
                  <div className="border-t border-border pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Follow us
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {brandSocials.map((social) => (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.name}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors ${social.hover}`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d={social.path} />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
