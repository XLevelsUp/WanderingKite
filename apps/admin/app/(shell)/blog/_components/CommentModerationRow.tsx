'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { setBlogCommentStatus, deleteBlogComment } from '@/actions/blog-admin';
import type { BlogCommentStatus } from '@/lib/blog';

interface CommentModerationRowProps {
  id: string;
  authorName: string;
  authorEmail: string | null;
  body: string;
  status: BlogCommentStatus;
  createdAt: string;
  postTitle: string;
  postSlug: string;
}

export function CommentModerationRow({
  id,
  authorName,
  authorEmail,
  body,
  status,
  createdAt,
  postTitle,
  postSlug,
}: CommentModerationRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const moderate = (next: BlogCommentStatus) => {
    startTransition(async () => {
      const result = await setBlogCommentStatus(id, next);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(next === 'APPROVED' ? 'Comment approved.' : 'Comment rejected.');
      router.refresh();
    });
  };

  const remove = () => {
    startTransition(async () => {
      const result = await deleteBlogComment(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Comment deleted.');
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-white">{authorName}</span>
            {authorEmail && (
              <span className="text-xs text-slate-500">{authorEmail}</span>
            )}
            <span className="text-xs text-slate-600">
              {new Date(createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{body}</p>

          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            on
            {postSlug ? (
              // Public post lives on apps/marketing now — a separate
              // deployment, so this is an external link built from
              // NEXT_PUBLIC_MARKETING_URL, not a relative in-app route.
              <a
                href={`${process.env.NEXT_PUBLIC_MARKETING_URL ?? ''}/blog/${postSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 underline underline-offset-2 hover:text-slate-200"
              >
                {postTitle}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span>{postTitle}</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          {status !== 'APPROVED' && (
            <Button
              variant="ghost"
              size="icon"
              title="Approve"
              disabled={isPending}
              onClick={() => moderate('APPROVED')}
            >
              <Check className="h-4 w-4 text-emerald-400" />
            </Button>
          )}
          {status !== 'REJECTED' && (
            <Button
              variant="ghost"
              size="icon"
              title="Reject"
              disabled={isPending}
              onClick={() => moderate('REJECTED')}
            >
              <X className="h-4 w-4 text-amber-400" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="Delete permanently"
            disabled={isPending}
            onClick={remove}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}
