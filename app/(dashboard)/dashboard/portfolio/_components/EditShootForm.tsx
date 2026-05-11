'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { updateShoot } from '@/actions/shoots';
import { Database } from '@/lib/database.types';

type Shoot = Database['public']['Tables']['shoots']['Row'];

export function EditShootForm({ shoot }: { shoot: Shoot }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await updateShoot(shoot.id, formData);
      window.alert('Shoot details updated successfully!');
    } catch (error: any) {
      console.error(error);
      window.alert(`Error: ${error.message || 'Failed to update shoot'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Shoot Details</CardTitle>
          <CardDescription>Update basic information</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-3'>
            <Label htmlFor='title'>Shoot Title</Label>
            <Input
              id='title'
              name='title'
              defaultValue={shoot.title}
              required
            />
          </div>

          <div className='grid gap-3'>
            <Label htmlFor='category'>Main Category</Label>
            <select
              id='category'
              name='category'
              defaultValue={shoot.category}
              required
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='Events'>Events</option>
              <option value='Portraits'>Portraits</option>
              <option value='Corporate'>Corporate</option>
              <option value='Commercial'>Commercial</option>
            </select>
          </div>

          <div className='grid gap-3'>
            <Label htmlFor='sub_category'>Sub-Category</Label>
            <select
              id='sub_category'
              name='sub_category'
              defaultValue={shoot.sub_category || ''}
              required
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value=''>-- Select Sub-Category --</option>
              <optgroup label="Events">
                <option value='wedding'>Wedding</option>
                <option value='engagements'>Engagements</option>
                <option value='birthdays'>Birthdays</option>
                <option value='house-warming'>House Warming</option>
                <option value='puberty-ceremonies'>Puberty Ceremonies</option>
              </optgroup>
              <optgroup label="Portraits">
                <option value='family'>Family</option>
                <option value='maternity'>Maternity</option>
                <option value='baby-shoots'>Baby Shoots</option>
              </optgroup>
              <optgroup label="Corporate">
                <option value='product'>Product</option>
                <option value='cinematic-videos'>Cinematic Videos</option>
                <option value='social-media'>Social Media</option>
                <option value='model-shoots'>Model Shoots</option>
                <option value='headshots'>Headshots</option>
              </optgroup>
              <optgroup label="Commercial">
                <option value='ads'>Ads</option>
                <option value='music-videos'>Music Videos</option>
                <option value='short-films'>Short Films</option>
              </optgroup>
            </select>
          </div>

          <div className='grid gap-3'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              name='description'
              defaultValue={shoot.description || ''}
              rows={4}
            />
          </div>

          <Button type='submit' className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
