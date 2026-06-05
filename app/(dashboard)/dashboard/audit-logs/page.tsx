import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShieldAlert, Clock, User, Camera, CalendarOff, AlertTriangle } from 'lucide-react';
import { getAuditClashLogs } from '@/actions/audit';

export const metadata: Metadata = {
  title: 'Audit Logs — Studio ERP',
  description: 'Security and conflict audit logs for equipment assignments.',
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

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';
  if (!isAdmin) redirect('/dashboard');

  const logs = await getAuditClashLogs();

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
            Security history of scheduling conflicts and double-booking attempts.
          </p>
        </div>
      </div>

      {/* ── Info Alert ── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <AlertTriangle className="w-5 h-5 text-amber-500/70 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm text-foreground/60 leading-relaxed">
          <p>
            This log tracks whenever an employee attempts to book an equipment that is already assigned to another project during the selected time period.
          </p>
        </div>
      </div>

      {/* ── Logs Table ── */}
      <div className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-foreground/40 font-medium">
                <th className="px-5 py-3 font-medium">Attempted By</th>
                <th className="px-5 py-3 font-medium">Equipment Requested</th>
                <th className="px-5 py-3 font-medium">Dates Requested</th>
                <th className="px-5 py-3 font-medium text-right">Attempt Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-foreground/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="w-8 h-8 opacity-20" />
                      <p>No clash attempts logged.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-foreground/50" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground/90">
                            {log.user_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-foreground/40">
                            {log.user_email || 'No email available'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Equipment */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-primary/70 shrink-0" />
                        <div>
                          <p className="text-foreground/80">{log.equipment_name || 'Unknown Equipment'}</p>
                          <p className="text-[10px] text-foreground/40">{log.equipment_serial}</p>
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-foreground/70">
                          <Clock className="w-3.5 h-3.5 opacity-50" />
                          <span className="text-xs">{formatDateTime(log.attempted_start)}</span>
                        </div>
                        {log.attempted_end && (
                          <div className="flex items-center gap-2 text-foreground/70">
                            <CalendarOff className="w-3.5 h-3.5 opacity-50" />
                            <span className="text-xs">{formatDateTime(log.attempted_end)}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-foreground/50">
                        {formatDateTime(log.created_at)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
