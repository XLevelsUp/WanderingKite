import { getShoots } from '@/actions/shoots';
import { Button } from '@/components/ui/button';
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
import Link from 'next/link';
import { Image as ImageIcon, Camera } from 'lucide-react';
import { DeleteShootButton } from './_components/DeleteShootButton';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { hasAccess } from '@/lib/access';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/dashboard/portfolio')) {
    redirect('/dashboard');
  }

  const shoots = await getShoots();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Management
          </h1>
          <p className="text-foreground/40 mt-2 text-sm">
            Manage your photography shoots and gallery images
          </p>
        </div>
        <Link href="/dashboard/portfolio/new">
          <Button>Add New Shoot</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shoots</CardTitle>
          <CardDescription>
            {shoots.length} shoots in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shoots.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-foreground/40 py-8"
                  >
                    No shoots found. Add your first shoot to get started.
                  </TableCell>
                </TableRow>
              ) : (
                shoots.map((shoot: any) => (
                  <TableRow key={shoot.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {shoot.gallery_images &&
                        shoot.gallery_images.length > 0 ? (
                          <img
                            src={shoot.gallery_images[0].url}
                            alt=""
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Camera className="w-4 h-4 text-foreground/30" />
                        )}
                      </div>
                      {shoot.title}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/12 text-amber-400 border border-amber-500/25">
                        {shoot.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-foreground/60 text-sm">
                        <ImageIcon className="w-4 h-4" />
                        {shoot.gallery_images?.length || 0} images
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/60 text-sm">
                      {new Date(shoot.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Link href={`/dashboard/portfolio/${shoot.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                      <DeleteShootButton id={shoot.id} title={shoot.title} />
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
