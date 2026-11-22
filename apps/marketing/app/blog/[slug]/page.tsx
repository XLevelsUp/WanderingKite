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
import { getBlogPostBySlug, getApprovedComments } from '@/actions/blog-public';
import {
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  excerptFrom,
  imageFitClass,
  type BlogCategory,
} from '@/lib/blog';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://wanderingkite.in';
const WRAP = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 2xl:max-w-[88rem] 3xl:max-w-[112rem] 3xl:px-16';

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

      <main className="min-h-screen pt-28 sm:pt-32">
        <article>
          {/* ── Hero ── */}
          <div className={WRAP}>
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All posts
            </Link>

            <div className="mb-8">
              <Link
                href={`/blog?category=${CATEGORY_SLUGS[post.category as BlogCategory]}`}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold tracking-wider text-accent-text transition-colors hover:border-accent-text/50"
              >
                {CATEGORY_LABELS[post.category as BlogCategory] ?? post.category}
              </Link>
              <h1 className="max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
            </div>

            {post.featured_image && (
              <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-3xl border border-border bg-card">
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

          {/* ── Body + sidebar ── */}
          <div className={`${WRAP} pb-20`}>
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

              <aside className="lg:col-span-4 lg:self-start lg:sticky lg:top-28">
                <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-foreground/70">
                      <User className="h-4 w-4 text-accent-text" />
                      <span className="font-medium text-foreground">{post.author}</span>
                    </div>
                    <div className="text-foreground/70">
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/70">
                      <Clock className="h-4 w-4 text-accent-text" />
                      {post.reading_time} min read
                    </div>
                  </div>

                  {(post.tags ?? []).length > 0 && (
                    <div className="border-t border-border pt-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/60">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag: string) => (
                          <Link
                            key={tag}
                            href={`/blog?tag=${encodeURIComponent(tag)}`}
                            className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-foreground/70 transition-colors hover:border-accent-text/40 hover:text-foreground"
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground/70 transition-colors hover:border-accent-text/40 hover:text-foreground"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {comments.length} comment{comments.length === 1 ? '' : 's'}
                    </a>
                    <BlogShareButton title={post.title} />
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/60">
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
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:text-accent-text hover:border-accent-text/40`}
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

      <Footer showInstagram={false} tone="sandstone" />
    </>
  );
}
