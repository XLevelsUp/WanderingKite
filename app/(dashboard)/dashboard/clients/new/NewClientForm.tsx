'use client';

import { useState } from 'react';
import { createNewClient } from '@/actions/clients';
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
import { useRouter } from 'next/navigation';

export function NewClientForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      await createNewClient(formData);
      router.push('/dashboard/clients');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Enter the details for the new client
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name *</Label>
            <Input
              id='name'
              name='name'
              placeholder='e.g., John Doe'
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email *</Label>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='john@example.com'
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input
              id='phone'
              name='phone'
              type='tel'
              placeholder='+1 (555) 123-4567'
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='govt_id'>Government ID</Label>
            <Input
              id='govt_id'
              name='govt_id'
              placeholder="e.g., Driver's License Number"
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='address'>Address</Label>
            <Textarea
              id='address'
              name='address'
              placeholder="Client's full address..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className='flex gap-4 pt-4'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Client'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
