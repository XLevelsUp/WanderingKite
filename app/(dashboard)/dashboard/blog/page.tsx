import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileText, MessageSquare, Plus, Pencil, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { createClient } from '@/lib/supabase/server';
import { hasAccess } from '@/lib/access';
import { getBlogPosts } from '@/actions/blog';
import { CATEGORY_LABELS, type BlogCategory } from '@/lib/blog';
import { DeleteBlogPostButton } from './_components/DeleteBlogPostButton';

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
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

  const posts = await getBlogPosts();

  const { count: pendingCount } = await supabase
    .from('blog_comments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'PENDING');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog</h1>
          <p className="text-sm text-slate-400">
            Posts publish as soon as you save them.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/blog/comments">
              <MessageSquare className="mr-2 h-4 w-4" />
              Comments
              {(pendingCount ?? 0) > 0 && (
                <Badge className="ml-2 bg-amber-500/20 text-amber-300">
                  {pendingCount}
                </Badge>
              )}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/blog/new">
              <Plus className="mr-2 h-4 w-4" />
              New post
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-amber-500" />
            All posts
          </CardTitle>
          <CardDescription>{posts.length} post(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-400">Title</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Published</TableHead>
                <TableHead className="text-slate-400">Read</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="border-transparent py-8 text-center italic text-slate-500"
                  >
                    No posts yet — create your first one.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post: any) => (
                  <TableRow key={post.id} className="border-slate-850">
                    <TableCell className="font-semibold text-white">
                      <div className="flex flex-col gap-0.5">
                        <span>{post.title}</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          {post.section === 'STUDIO' ? '/studiospace/blog' : '/blog'}
                          /{post.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[post.category as BlogCategory] ?? post.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-300">
                      {new Date(post.published_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">
                      {post.reading_time} min
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title="View live">
                          <Link href={`${post.section === 'STUDIO' ? '/studiospace/blog' : '/blog'}/${post.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" title="Edit">
                          <Link href={`/dashboard/blog/${post.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteBlogPostButton id={post.id} title={post.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
