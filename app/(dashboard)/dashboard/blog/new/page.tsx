import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { hasAccess } from '@/lib/access';
import { BlogPostForm } from '@/components/blog/BlogPostForm';

export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">New post</h1>
          <p className="text-sm text-slate-400">
            Saving publishes it immediately.
          </p>
        </div>
      </div>

      <BlogPostForm />
    </div>
  );
}
