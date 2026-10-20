import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStorageDevices } from '@/actions/media-tracker';
import { canManageMediaTracker } from '@/lib/access';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { StorageDevicesTable } from './StorageDevicesTable';

export const dynamic = 'force-dynamic';

export default async function StorageDevicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, can_manage_media_tracker')
    .eq('id', user.id)
    .single();

  const isEmployee = !canManageMediaTracker(profile?.role ?? 'EMPLOYEE', profile?.can_manage_media_tracker);

  const devices = await getStorageDevices();

  return (
    <div className="space-y-6">
      <Link href="/media-tracker">
        <Button size="sm" variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Media Tracker
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Storage Devices
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage the hard disk, SSD, and cloud inventory used across media records.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Inventory</CardTitle>
          <CardDescription>
            Retire a device to hide it from pickers while keeping history, or
            delete it permanently if it was never actually used.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StorageDevicesTable
            devices={devices as any}
            isEmployee={isEmployee}
          />
        </CardContent>
      </Card>
    </div>
  );
}
