import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getPhotoCatalog, getShootById } from '@/actions/shoots-admin';
import { redirect } from 'next/navigation';
import { AddGalleryImageForm } from '../_components/AddGalleryImageForm';
import { GalleryManager } from '../_components/GalleryManager';
import { ShootForm } from '../_components/ShootForm';

export default async function EditShootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [shoot, { categories, cities }] = await Promise.all([getShootById(id), getPhotoCatalog()]);

  if (!shoot) {
    redirect('/portfolio');
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/portfolio">
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
          <ShootForm shoot={shoot} categories={categories} cities={cities} />
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
              {/* Website order; first = shown first. Cover is the album card image. */}
              <GalleryManager shootId={shoot.id} images={shoot.gallery_images ?? []} coverUrl={shoot.cover_image_url} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
