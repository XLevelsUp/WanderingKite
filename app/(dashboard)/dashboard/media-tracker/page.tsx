import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMediaRecords, getStorageDevices } from '@/actions/media-tracker';
import { getClients } from '@/actions/clients';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { HardDrive, LayoutGrid, Plus, Settings2, UserCog } from 'lucide-react';
import { MediaTrackerFilterBar } from './MediaTrackerFilterBar';
import { DEVICE_TYPE_LABEL, hasBackupRisk, NoBackupPill, hasUnloggedContent, NotLoggedPill } from './status';
import { DeleteMediaRecordButton } from '@/components/dashboard/DeleteMediaRecordButton';
import { EditMediaRecordDialog } from './EditMediaRecordDialog';
import { ExportCsvButton } from './ExportCsvButton';

export const dynamic = 'force-dynamic';

export default async function MediaTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
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

  const query = typeof resolved.q === 'string' ? resolved.q : undefined;
  const unlinkedOnly = resolved.unlinked === '1';

  const [records, clients, devices] = await Promise.all([
    getMediaRecords({ query, unlinkedOnly }),
    isEmployee ? Promise.resolve([]) : getClients().catch(() => []),
    isEmployee ? Promise.resolve([]) : getStorageDevices(true).catch(() => []),
  ]);

  const clientOptions = (clients as any[]).map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const deviceOptions = (devices as any[]).map((d) => ({
    id: d.id,
    label: d.label,
    type: d.type,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <HardDrive className="h-6 w-6 text-primary" />
            Media Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track where each client's footage, backups, and edit status live.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <ExportCsvButton
            filters={{ query, unlinkedOnly }}
          />
          <Link href="/dashboard/media-tracker/editors">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              <UserCog className="h-4 w-4 mr-1.5" />
              Editor Tracker
            </Button>
          </Link>
          <Link href="/dashboard/media-tracker/map">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Storage Map
            </Button>
          </Link>
          <Link href="/dashboard/media-tracker/devices">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              <Settings2 className="h-4 w-4 mr-1.5" />
              Manage Devices
            </Button>
          </Link>
          {!isEmployee && (
            <Link href="/dashboard/media-tracker/new">
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1.5" />
                New Record
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shoot Records</CardTitle>
          <CardDescription>{records.length} tracked shoot(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <MediaTrackerFilterBar />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Shoot / Title</TableHead>
                  <TableHead>Primary Storage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                      No media records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.client?.name ?? (
                          <span className="text-slate-500">No client</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/media-tracker/${r.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {r.title}
                        </Link>
                        {(r.shoot_date || r.category) && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {r.shoot_date &&
                              new Date(r.shoot_date).toLocaleDateString('en-IN')}
                            {r.shoot_date && r.category && ' · '}
                            {r.category}
                          </p>
                        )}
                        {(hasBackupRisk(r) || hasUnloggedContent(r)) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {hasBackupRisk(r) && <NoBackupPill />}
                            {hasUnloggedContent(r) && <NotLoggedPill />}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.primary_storage ? (
                          <span className="text-sm">
                            {r.primary_storage.label}{' '}
                            <span className="text-slate-500">
                              ({DEVICE_TYPE_LABEL[r.primary_storage.type] ?? r.primary_storage.type})
                            </span>
                            {!r.primary_storage.is_active && (
                              <span className="ml-1.5 text-[10px] uppercase text-amber-500">
                                Retired
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/media-tracker/${r.id}`}>
                            <Button size="sm" variant="secondary">
                              View
                            </Button>
                          </Link>
                          {!isEmployee && (
                            <>
                              <EditMediaRecordDialog
                                record={r}
                                clients={clientOptions}
                                devices={deviceOptions}
                              />
                              <DeleteMediaRecordButton
                                recordId={r.id}
                                recordTitle={r.title}
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
