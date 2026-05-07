'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addGalleryImage } from '@/actions/shoots';
import { ImageUpload } from '@/components/shared/ImageUpload';

export function AddGalleryImageForm({ shootId }: { shootId: string }) {
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    try {
      await addGalleryImage(shootId, url, altText);
      setUrl('');
      setAltText('');
    } catch (error) {
      console.error(error);
      alert('Failed to add image.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3">
        <Label>Upload Image</Label>
        <ImageUpload
          value={url || null}
          onChange={setUrl}
          bucket='equipment-images'
          folder='portfolio'
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Drag &amp; drop an image here. It will upload directly to Supabase.
        </p>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="altText">Alt Text (Optional)</Label>
        <Input
          id="altText"
          placeholder="A description of the image for SEO"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Image'}
      </Button>
    </form>
  );
}
