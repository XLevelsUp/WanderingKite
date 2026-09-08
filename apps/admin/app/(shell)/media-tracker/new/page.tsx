import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getClients } from '@/actions/clients-admin';
import { getStorageDevices } from '@/actions/media-tracker';
import { canManageMediaTracker } from '@/lib/access';
import { MediaRecordForm } from '../MediaRecordForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function NewMediaRecordPage() {
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

  if (!profile || !canManageMediaTracker(profile.role, profile.can_manage_media_tracker)) {
    redirect('/media-tracker');
  }

  const [clients, devices] = await Promise.all([
    getClients().catch(() => []),
    getStorageDevices(true).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          New Media Record
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track a client shoot's storage, backups, and editing status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shoot Details</CardTitle>
          <CardDescription>
            Link an existing booking or create a standalone record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MediaRecordForm
            clients={clients.map((c: any) => ({ id: c.id, name: c.name }))}
            devices={devices.map((d: any) => ({
              id: d.id,
              label: d.label,
              type: d.type,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
