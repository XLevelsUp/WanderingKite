'use client';

import { useState } from 'react';
import {
  createEquipment,
  getCategories,
  getBranches,
} from '@/actions/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface NewEquipmentFormProps {
  categories: Array<{ id: string; name: string }>;
  branches: Array<{ id: string; name: string }>;
}

export function NewEquipmentForm({
  categories,
  branches,
}: NewEquipmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('category_id', selectedCategory);
      formData.set('branch_id', selectedBranch);

      await createEquipment(formData);
      router.push('/dashboard/equipment');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create equipment');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
          <CardDescription>
            Enter the details for the new equipment item
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='name'>Equipment Name *</Label>
            <Input
              id='name'
              name='name'
              placeholder='e.g., Canon EOS R5'
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='serial_number'>Serial Number *</Label>
            <Input
              id='serial_number'
              name='serial_number'
              placeholder='e.g., SN123456789'
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='category'>Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              required
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='branch'>Branch *</Label>
            <Select
              value={selectedBranch}
              onValueChange={setSelectedBranch}
              required
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a branch' />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='rental_price'>Rental Price (per day) *</Label>
            <Input
              id='rental_price'
              name='rental_price'
              type='number'
              step='0.01'
              min='0'
              placeholder='0.00'
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              name='description'
              placeholder='Additional details about this equipment...'
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className='flex gap-4 pt-4'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Equipment'}
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
