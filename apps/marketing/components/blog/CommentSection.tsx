'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitBlogComment } from '@/actions/blog-public';

interface ApprovedComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  comments: ApprovedComment[];
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitBlogComment({
        postId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        body: body.trim(),
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Nothing is added to the list — the comment is pending until a
      // moderator approves it, and pretending otherwise would be misleading.
      setName('');
      setEmail('');
      setBody('');
      setSubmitted(true);
      toast.success(result?.message ?? 'Comment submitted for review.');
    });
  };

  return (
    <section id="comments" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
        <MessageSquare className="h-5 w-5 text-accent-text" />
        Comments
        {comments.length > 0 && (
          <span className="text-base font-normal text-foreground/50">
            ({comments.length})
          </span>
        )}
      </h2>

      {comments.length > 0 && (
        <div className="mb-10 space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">
                  {comment.author_name}
                </span>
                <span className="text-xs text-foreground/60">
                  {new Date(comment.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/70">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-1 text-lg font-bold text-foreground">Leave a comment</h3>
        <p className="mb-5 text-xs text-foreground/60">
          Comments are reviewed before they appear.
        </p>

        {submitted ? (
          <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-4 text-sm text-emerald-700">
            Thanks — your comment has been submitted.
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="ml-2 underline underline-offset-2 hover:text-emerald-600"
            >
              Write another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="comment-name">Name *</Label>
                <Input
                  id="comment-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={120}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment-email">
                  Email <span className="text-foreground/50">(optional)</span>
                </Label>
                <Input
                  id="comment-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment-body">Comment *</Label>
              <textarea
                id="comment-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                maxLength={2000}
                rows={4}
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent-text/50 focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Share your thoughts…"
              />
              <p className="text-right text-[11px] text-foreground/50">
                {body.length}/2000
              </p>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Submitting…' : 'Submit comment'}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
