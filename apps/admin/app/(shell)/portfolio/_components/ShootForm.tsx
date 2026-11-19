'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { createShoot, updateShoot, type PhotoCategory, type PhotoCity } from '@/actions/shoots-admin';
import type { Database } from '@/lib/database.types';

type Shoot = Database['public']['Tables']['shoots']['Row'];

const SELECT =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/** Album form for both "New" and "Edit": category/city come from the photo catalog tables, so new ones added in the DB appear here automatically. */
export function ShootForm({ shoot, categories, cities }: { shoot?: Shoot; categories: PhotoCategory[]; cities: PhotoCity[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(shoot?.slug ?? null);

  // Group categories as "Weddings & Events · Wedding" → Hindu, Muslim…
  const groups = categories.reduce<Record<string, PhotoCategory[]>>((acc, c) => {
    const key = `${c.section_name} · ${c.group_name}`;
    (acc[key] ??= []).push(c);
    return acc;
  }, {});
  const sectionOf = (id: string | null) => categories.find((c) => c.id === id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      if (shoot) {
        const res = await updateShoot(shoot.id, formData);
        setSlug(res.slug ?? null);
        router.refresh();
      } else {
        const created = await createShoot(formData);
        router.push(`/portfolio/${created.id}`);
      }
    } catch (err: any) {
      logger.error('[ShootForm]', err);
      setError(err.message || 'Failed to save album');
    } finally {
      setIsSubmitting(false);
    }
  }

  const cat = sectionOf(shoot?.category_id ?? null);
  const publicPath = cat && slug ? `/photography/${cat.section_slug}/${cat.slug}/${slug}` : null;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Album Details</CardTitle>
          <CardDescription>Shown on the website's photography pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="title">Album Title</Label>
            <Input id="title" name="title" defaultValue={shoot?.title} required placeholder="e.g., Arun & Priya — Kongu Wedding" />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="client_names">Couple / Client Names</Label>
            <Input id="client_names" name="client_names" defaultValue={shoot?.client_names ?? ''} placeholder="e.g., Arun & Priya" />
            <p className="text-xs text-muted-foreground">Shown as the album card's title. Also used for the web address if left blank below.</p>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="category_id">Category</Label>
            <select id="category_id" name="category_id" defaultValue={shoot?.category_id ?? ''} className={SELECT}>
              <option value="">— Not assigned (stays draft) —</option>
              {Object.entries(groups).map(([label, cats]) => (
                <optgroup key={label} label={label}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.subgroup ? `${c.subgroup} · ${c.name}` : c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="city_slug">City</Label>
              <select id="city_slug" name="city_slug" defaultValue={shoot?.city_slug ?? ''} className={SELECT}>
                <option value="">— None —</option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="shoot_date">Shoot Date</Label>
              <Input id="shoot_date" name="shoot_date" type="date" defaultValue={shoot?.shoot_date ?? ''} />
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="story">Story</Label>
            <Textarea id="story" name="story" defaultValue={shoot?.story ?? ''} rows={4} placeholder="2–3 lines about the day, shown on the album page" />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description">Internal Notes</Label>
            <Textarea id="description" name="description" defaultValue={shoot?.description ?? ''} rows={2} />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="slug">Web Address</Label>
            <Input id="slug" name="slug" defaultValue={shoot?.slug ?? ''} placeholder="auto from names/title" />
            {publicPath && <p className="break-all text-xs text-muted-foreground">{publicPath}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="status">Visibility</Label>
              <select id="status" name="status" defaultValue={shoot?.status ?? 'draft'} className={SELECT}>
                <option value="draft">Draft — hidden</option>
                <option value="published">Published — live</option>
              </select>
            </div>
            <label className="flex items-center gap-3 self-end rounded-md border border-input px-3 py-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={shoot?.featured ?? false} className="h-4 w-4" />
              Feature on Photography home
            </label>
          </div>

          {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : shoot ? 'Save Changes' : 'Create Album'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
