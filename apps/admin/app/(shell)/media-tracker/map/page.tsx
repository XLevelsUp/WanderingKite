import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMediaRecords, getStorageDevices } from '@/actions/media-tracker';
import { canManageMediaTracker } from '@/lib/access';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { StorageMap } from './StorageMap';

export const dynamic = 'force-dynamic';

export default async function StorageMapPage() {
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

  const [devices, records] = await Promise.all([
    getStorageDevices().catch(() => []),
    getMediaRecords().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/media-tracker">
        <Button size="sm" variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Media Tracker
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-primary" />
          Storage Map
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Every device at a glance — click one to see exactly what&apos;s stored
          on it and manage locations.
        </p>
      </div>

      <StorageMap
        devices={devices as any}
        records={records as any}
        isEmployee={isEmployee}
      />
    </div>
  );
}
