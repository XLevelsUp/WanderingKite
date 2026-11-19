import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react';
import { publicClient } from '@/lib/supabase/public';
import { CATEGORY_LABELS, excerptFrom, imageFitClass, type BlogCategory } from '@/lib/blog';
import { MediaPlaceholder } from './MediaPlaceholder';

interface PreviewPost {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  featured_image_fit: string | null;
  intro: string | null;
  reading_time: number | null;
  published_at: string | null;
}

// Same query as the /blog listing (newest photography posts), but cookie-free and cached so the hub stays ISR.
const getLatestPosts = unstable_cache(
  async (): Promise<PreviewPost[]> => {
    // blog_posts isn't in the generated Database types yet, hence the untyped table access.
    const { data, error } = await (publicClient() as unknown as { from: (t: string) => any })
      .from('blog_posts')
      .select('id, slug, title, category, featured_image, featured_image_alt, featured_image_fit, intro, reading_time, published_at')
      .eq('section', 'PHOTOGRAPHY')
      .order('published_at', { ascending: false })
      .limit(3);
    return error || !data ? [] : (data as PreviewPost[]);
  },
  ['photography-blog-preview'],
  { revalidate: 300, tags: ['blog'] }
);

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

function Meta({ p }: { p: PreviewPost }) {
  const date = fmtDate(p.published_at);
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/65">
      {date && <time dateTime={p.published_at ?? undefined}>{date}</time>}
      {p.reading_time ? (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-primary-deep" aria-hidden />
          {p.reading_time} min read
        </span>
      ) : null}
    </span>
  );
}

/**
 * Journal preview (white tone): lead article as a large framed card, the next two as thumbnail rows beside it (lg)
 * or below it (phones). Hidden entirely when there are no posts.
 */
export async function BlogPreview({ wrap }: { wrap: string }) {
  const posts = await getLatestPosts();
  if (!posts.length) return null;
  const [lead, ...rest] = posts;

  return (
    <section aria-labelledby="journal-heading" data-tone="white">
      <div className={`${wrap} py-16 sm:py-20 lg:py-24`}>
        <div data-reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-text">The Journal</p>
            <h2 id="journal-heading" className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Photography Stories &amp; Insights
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex h-12 items-center gap-2 self-start rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
          >
            Read the blog
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-16">
          {/* ── Lead article ── */}
          <article data-reveal="frame" className="lg:col-span-7">
            <Link href={`/blog/${lead.slug}`} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4">
              <div className="relative">
                <div aria-hidden className="absolute -bottom-3 -right-3 left-3 top-3 rounded-2xl bg-[#CBB9A4] transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1 sm:-bottom-4 sm:-right-4 sm:left-4 sm:top-4" />
                <div className="relative rounded-2xl bg-[#FAF9F6] p-2 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)] sm:p-3">
                  <div className="frame-media relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                    {lead.featured_image ? (
                      <Image
                        src={lead.featured_image}
                        alt={lead.featured_image_alt || lead.title}
                        fill
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        className={`${imageFitClass(lead.featured_image_fit)} transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none`}
                      />
                    ) : (
                      <MediaPlaceholder className="absolute inset-0" label="Article cover" />
                    )}
                    {lead.category && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#FAF9F6]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-deep backdrop-blur-sm">
                        {CATEGORY_LABELS[lead.category] ?? lead.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Meta p={lead} />
                <h3 className="mt-2 text-2xl font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary-deep sm:text-3xl">{lead.title}</h3>
                {lead.intro && <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/80">{excerptFrom(lead.intro, 180)}</p>}
              </div>
            </Link>
          </article>

          {/* ── More articles ── */}
          {rest.length > 0 && (
            <ul className="lg:col-span-5 lg:self-center">
              {rest.map((p, i) => (
                <li key={p.id} data-reveal style={d(200 + i * 150)} className="relative">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/60 via-primary/25 to-transparent" />
                  <Link href={`/blog/${p.slug}`} className="group grid grid-cols-[7rem_1fr] gap-4 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <span className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      {p.featured_image ? (
                        <Image
                          src={p.featured_image}
                          alt={p.featured_image_alt || p.title}
                          fill
                          sizes="9rem"
                          className={`${imageFitClass(p.featured_image_fit)} transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08] motion-reduce:transition-none`}
                        />
                      ) : (
                        <MediaPlaceholder className="absolute inset-0" corners={false} />
                      )}
                    </span>
                    <span className="min-w-0">
                      {p.category && (
                        <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-deep">
                          {CATEGORY_LABELS[p.category] ?? p.category}
                        </span>
                      )}
                      <span className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary-deep sm:text-lg">
                        {p.title}
                      </span>
                      <span className="mt-2 flex items-center justify-between gap-2">
                        <Meta p={p} />
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-primary-deep transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
