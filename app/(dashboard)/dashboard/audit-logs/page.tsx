import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { getAuditClashLogs, getStudioBookingConflicts } from '@/actions/audit';
import { getLoginActivity, getClickEvents, getClickLeaderboard, getAuditLog } from '@/actions/activity';
import { AuditLogsClient } from '@/components/dashboard/AuditLogsClient';

export const metadata: Metadata = {
  title: 'Audit Logs — Studio ERP',
  description: 'Staff activity, click analytics, and data-change audit trail.',
};

export const dynamic = 'force-dynamic';

function formatDateTime(isoString: string) {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export default async function AuditLogsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const defaultTab =
    searchParams?.tab === 'studio'
      ? 'studio'
      : searchParams?.tab === 'logins'
        ? 'logins'
        : searchParams?.tab === 'clicks'
          ? 'clicks'
          : searchParams?.tab === 'changes'
            ? 'changes'
            : 'equipment';

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';
  if (!isSuperAdmin) redirect('/dashboard');

  // 30-day default matches AuditLogsClient's initial date-range selection —
  // keeps the first render consistent with what the filter UI shows as active.
  const clashLogs = await getAuditClashLogs();
  const studioConflicts = await getStudioBookingConflicts();
  const loginActivity = await getLoginActivity({ days: 30 });
  const clickEvents = await getClickEvents({ days: 30 });
  const clickLeaderboard = await getClickLeaderboard(30);
  const auditLog = await getAuditLog({ days: 30 });

  return (
    <div className="relative space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
              <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground/90 tracking-tight">
              Audit Logs
            </h1>
          </div>
          <p className="text-sm text-foreground/45 ml-11.5">
            Scheduling conflicts, staff login activity, click analytics, and the full data-change history.
          </p>
        </div>
      </div>

      <AuditLogsClient
        clashLogs={clashLogs}
        studioConflicts={studioConflicts}
        loginActivity={loginActivity}
        clickEvents={clickEvents}
        clickLeaderboard={clickLeaderboard}
        auditLog={auditLog}
        defaultTab={defaultTab}
      />
    </div>
  );
}
