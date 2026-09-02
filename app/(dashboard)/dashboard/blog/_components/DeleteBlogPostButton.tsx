'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteBlogPost } from '@/actions/blog';

export function DeleteBlogPostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBlogPost(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Post deleted.');
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="Delete"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 text-red-400" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
            <DialogDescription>
              &ldquo;{title}&rdquo; and all of its sections, Q&amp;A, and comments
              will be permanently removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting…' : 'Delete post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
