import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMediaRecords, getAssignmentHistory } from '@/actions/media-tracker';
import { getEmployees } from '@/actions/employees';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCog } from 'lucide-react';
import { EditorTracker } from './EditorTracker';

export const dynamic = 'force-dynamic';

export default async function EditorTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ record?: string }>;
}) {
  const { record: recordId } = await searchParams;
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

  const [records, employees, history] = await Promise.all([
    getMediaRecords(),
    getEmployees().catch(() => []),
    getAssignmentHistory().catch(() => []),
  ]);

  const employeeOptions = (employees as any[]).map((e) => ({
    id: e.id,
    fullName: e.fullName ?? null,
  }));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/media-tracker">
        <Button size="sm" variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Media Tracker
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserCog className="h-6 w-6 text-primary" />
          Editor Tracker
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Reassign editors, move a shoot to its next stage, and see the full
          history of who had it and when.
        </p>
      </div>

      <EditorTracker
        records={records as any}
        employees={employeeOptions}
        history={history as any}
        isEmployee={isEmployee}
        initialRecordId={recordId ?? null}
      />
    </div>
  );
}
