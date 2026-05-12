import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getShootById } from '@/actions/shoots';
import { redirect } from 'next/navigation';
import { AddGalleryImageForm } from '../_components/AddGalleryImageForm';
import { DeleteGalleryImageButton } from '../_components/DeleteGalleryImageButton';
import { EditShootForm } from '../_components/EditShootForm';

export default async function EditShootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shoot = await getShootById(id);

  if (!shoot) {
    redirect('/dashboard/portfolio');
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/portfolio">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Shoot</h1>
          <p className="text-foreground/40 mt-1 text-sm">
            Edit details and manage gallery images
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shoot Details Form */}
        <div className="lg:col-span-1">
          <EditShootForm shoot={shoot} />
        </div>

        {/* Right Column: Image Management */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Add New Image</CardTitle>
              <CardDescription>
                Attach an image to this shoot gallery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddGalleryImageForm shootId={shoot.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Gallery Images ({shoot.gallery_images?.length || 0})
              </CardTitle>
              <CardDescription>Current images in this shoot</CardDescription>
            </CardHeader>
            <CardContent>
              {shoot.gallery_images && shoot.gallery_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {shoot.gallery_images.map((img: any) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      <img
                        src={img.url}
                        alt={img.alt_text || 'Gallery image'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <DeleteGalleryImageButton
                        id={img.id}
                        shootId={shoot.id}
                      />
                      {img.alt_text && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {img.alt_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-xl border border-white/5 border-dashed">
                  No images added yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
