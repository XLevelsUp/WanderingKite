import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMediaRecord, getStorageDevices } from '@/actions/media-tracker';
import { getClients } from '@/actions/clients';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MediaRecordDetail } from './MediaRecordDetail';

export const dynamic = 'force-dynamic';

export default async function MediaRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isEmployee = profile?.role === 'EMPLOYEE';

  let record;
  try {
    record = await getMediaRecord(id);
  } catch {
    notFound();
  }

  const [clients, devices] = await Promise.all([
    getClients().catch(() => []),
    getStorageDevices(true).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/media-tracker">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {record.title}
        </h1>
      </div>

      <MediaRecordDetail
        record={record}
        isEmployee={isEmployee}
        clients={clients.map((c: any) => ({ id: c.id, name: c.name }))}
        devices={devices.map((d: any) => ({
          id: d.id,
          label: d.label,
          type: d.type,
        }))}
      />
    </div>
  );
}
