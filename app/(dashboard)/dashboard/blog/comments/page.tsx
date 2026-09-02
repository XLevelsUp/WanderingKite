import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { createClient } from '@/lib/supabase/server';
import { hasAccess } from '@/lib/access';
import { getBlogComments } from '@/actions/blog';
import { BLOG_COMMENT_STATUSES, type BlogCommentStatus } from '@/lib/blog';
import { CommentModerationRow } from '../_components/CommentModerationRow';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<BlogCommentStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  REJECTED: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default async function BlogCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

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

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/dashboard/blog')) {
    redirect('/dashboard');
  }

  // Default to the pending queue — that is the work to be done.
  const activeStatus = (BLOG_COMMENT_STATUSES as readonly string[]).includes(
    status ?? ''
  )
    ? (status as BlogCommentStatus)
    : 'PENDING';

  const comments = await getBlogComments(activeStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Comment moderation</h1>
          <p className="text-sm text-slate-400">
            Comments stay hidden from the public until approved.
          </p>
        </div>
      </div>

      {/* Status filter — server-rendered via URL search params */}
      <div className="flex flex-wrap gap-2">
        {BLOG_COMMENT_STATUSES.map((s) => {
          const isActive = activeStatus === s;
          return (
            <Link
              key={s}
              href={`/dashboard/blog/comments?status=${s}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? STATUS_STYLES[s]
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </Link>
          );
        })}
      </div>

      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            {activeStatus.charAt(0) + activeStatus.slice(1).toLowerCase()} comments
          </CardTitle>
          <CardDescription>{comments.length} comment(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm italic text-slate-500">
              Nothing here.
            </p>
          ) : (
            comments.map((comment: any) => (
              <CommentModerationRow
                key={comment.id}
                id={comment.id}
                authorName={comment.author_name}
                authorEmail={comment.author_email}
                body={comment.body}
                status={comment.status}
                createdAt={comment.created_at}
                postTitle={comment.blog_posts?.title ?? 'Unknown post'}
                postSlug={comment.blog_posts?.slug ?? ''}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
