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
import { useNotify } from '@/hooks/useNotify';
import { Loader2 } from 'lucide-react';
import { SourcePicker } from '@/components/dashboard/SourcePicker';

export function NewClientForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showInfo, showSuccess } = useNotify();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    let timeoutId: NodeJS.Timeout;

    try {
      timeoutId = setTimeout(() => {
        showInfo(
          'This is taking longer than usual. Please check your connection.'
        );
      }, 8000);

      const formData = new FormData(e.currentTarget);
      await createNewClient(formData);
      showSuccess('Client created successfully');
      router.push('/dashboard/clients');
      router.refresh();
    } catch (err: any) {
      showError(err.message || 'Failed to create client');
    } finally {
      clearTimeout(timeoutId!);
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., John Doe"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="govt_id">Government ID</Label>
            <Input
              id="govt_id"
              name="govt_id"
              placeholder="e.g., Driver's License Number"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Client's full address..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <SourcePicker disabled={isLoading} />

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating...' : 'Create Client'}
            </Button>
            <Button
              type="button"
              variant="outline"
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
