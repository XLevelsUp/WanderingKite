import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { hasAccess } from '@/lib/access';
import { getBlogPostById } from '@/actions/blog-admin';
import { BlogPostForm } from '@/components/blog/BlogPostForm';

export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/blog')) {
    redirect('/');
  }

  const post = await getBlogPostById(id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit post</h1>
            <p className="text-sm text-slate-400">
              {post.section === 'STUDIO' ? '/studiospace/blog' : '/blog'}/{post.slug}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          {/* Public blog post lives on apps/marketing now — a separate
              deployment, so this is an external link (plain <a>, not
              next/link's <Link>) built from NEXT_PUBLIC_MARKETING_URL
              rather than a relative in-app route. */}
          <a
            href={`${process.env.NEXT_PUBLIC_MARKETING_URL ?? ''}${post.section === 'STUDIO' ? '/studiospace/blog' : '/blog'}/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View live
          </a>
        </Button>
      </div>

      <BlogPostForm initialPost={post} />
    </div>
  );
}
