'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { logger } from '@/lib/logger';
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
import { createShoot } from '@/actions/shoots-admin';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function NewShootPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const newShoot = await createShoot(formData);

      window.alert(
        'Shoot created successfully! You can now upload images to the gallery.'
      );
      router.push(`/portfolio/${newShoot.id}`);
    } catch (error: any) {
      logger.error('[NewShoot]', error);
      window.alert(`Error: ${error.message || 'Failed to create shoot'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/portfolio">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Shoot</h1>
          <p className="text-foreground/40 mt-1 text-sm">
            Create a new portfolio gallery
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Shoot Details</CardTitle>
            <CardDescription>
              Basic information about the photography session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="title">Shoot Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., Summer Beach Wedding"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="category">Main Category</Label>
              <select
                id="category"
                name="category"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Events">Events</option>
                <option value="Portraits">Portraits</option>
                <option value="Corporate">Corporate</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="sub_category">Sub-Category</Label>
              <select
                id="sub_category"
                name="sub_category"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Select Sub-Category --</option>
                <optgroup label="Events">
                  <option value="wedding">Wedding</option>
                  <option value="engagements">Engagements</option>
                  <option value="birthdays">Birthdays</option>
                  <option value="house-warming">House Warming</option>
                  <option value="puberty-ceremonies">Puberty Ceremonies</option>
                </optgroup>
                <optgroup label="Portraits">
                  <option value="family">Family</option>
                  <option value="maternity">Maternity</option>
                  <option value="baby-shoots">Baby Shoots</option>
                </optgroup>
                <optgroup label="Corporate">
                  <option value="product">Product</option>
                  <option value="cinematic-videos">Cinematic Videos</option>
                  <option value="social-media">Social Media</option>
                  <option value="model-shoots">Model Shoots</option>
                  <option value="headshots">Headshots</option>
                </optgroup>
                <optgroup label="Commercial">
                  <option value="ads">Ads</option>
                  <option value="music-videos">Music Videos</option>
                  <option value="short-films">Short Films</option>
                </optgroup>
              </select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the shoot..."
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Link href="/portfolio">
                <Button variant="ghost" className="mr-2" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Shoot'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
