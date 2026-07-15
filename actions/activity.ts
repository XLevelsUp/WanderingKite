'use server';

import { adminAuthClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/** Only SUPER_ADMIN may read staff activity data — mirrors the audit-logs page gate. */
async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden');
  }
}

export interface LoginActivityRow {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  login_at: string;
  last_active_at: string;
  logout_at: string | null;
  ip_address: string | null;
  duration_seconds: number;
}

export async function getLoginActivity(): Promise<LoginActivityRow[]> {
  await requireSuperAdmin();

  const { data: sessions, error } = await adminAuthClient
    .from('user_sessions')
    .select('*')
    .order('login_at', { ascending: false })
    .limit(500);

  if (error || !sessions) {
    if (error) logger.error('Failed to fetch login activity:', error);
    return [];
  }

  const userIds = [...new Set(sessions.map((s) => s.user_id).filter(Boolean))];
  const { data: profiles } = await adminAuthClient
    .from('profiles')
    .select('id, email, "fullName"')
    .in('id', userIds);

  return sessions.map((s) => {
    const profile = profiles?.find((p) => p.id === s.user_id);
    const endTime = s.logout_at ?? s.last_active_at;
    const durationSeconds = Math.max(
      0,
      Math.round(
        (new Date(endTime).getTime() - new Date(s.login_at).getTime()) / 1000
      )
    );
    return {
      id: s.id,
      user_id: s.user_id,
      user_name: profile?.fullName ?? null,
      user_email: profile?.email ?? null,
      login_at: s.login_at,
      last_active_at: s.last_active_at,
      logout_at: s.logout_at,
      ip_address: s.ip_address,
      duration_seconds: durationSeconds,
    };
  });
}

export interface ClickEventRow {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  label: string;
  path: string;
  created_at: string;
}

export async function getClickEvents(): Promise<ClickEventRow[]> {
  await requireSuperAdmin();

  const { data: events, error } = await adminAuthClient
    .from('click_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error || !events) {
    if (error) logger.error('Failed to fetch click events:', error);
    return [];
  }

  const userIds = [...new Set(events.map((e) => e.user_id).filter(Boolean))];
  const { data: profiles } = await adminAuthClient
    .from('profiles')
    .select('id, email, "fullName"')
    .in('id', userIds);

  return events.map((e) => {
    const profile = profiles?.find((p) => p.id === e.user_id);
    return {
      id: e.id,
      user_id: e.user_id,
      user_name: profile?.fullName ?? null,
      user_email: profile?.email ?? null,
      label: e.label,
      path: e.path,
      created_at: e.created_at,
    };
  });
}

export interface ClickLeaderboardRow {
  label: string;
  path: string;
  count: number;
}

export async function getClickLeaderboard(): Promise<ClickLeaderboardRow[]> {
  await requireSuperAdmin();

  // No aggregate RPC exists yet — pull recent raw events and roll up in JS.
  // Fine at current volume; revisit with a SQL view/RPC if this grows large.
  const { data: events, error } = await adminAuthClient
    .from('click_events')
    .select('label, path')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error || !events) {
    if (error) logger.error('Failed to fetch click leaderboard:', error);
    return [];
  }

  const counts = new Map<string, ClickLeaderboardRow>();
  for (const e of events) {
    const key = `${e.label}::${e.path}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label: e.label, path: e.path, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 50);
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: unknown;
  new_data: unknown;
  severity: string;
  created_at: string;
}

/** audit_logs.user_id references auth.users, not profiles — PostgREST can't
 * embed it directly, so profiles are fetched separately and merged (same
 * pattern as actions/audit.ts). */
export async function getAuditLog(): Promise<AuditLogRow[]> {
  await requireSuperAdmin();

  const { data: logs, error } = await adminAuthClient
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error || !logs) {
    if (error) logger.error('Failed to fetch audit log:', error);
    return [];
  }

  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))];
  const { data: profiles } = await adminAuthClient
    .from('profiles')
    .select('id, email, "fullName"')
    .in('id', userIds);

  return logs.map((l) => {
    const profile = profiles?.find((p) => p.id === l.user_id);
    return {
      id: l.id,
      user_id: l.user_id,
      user_name: profile?.fullName ?? null,
      user_email: profile?.email ?? null,
      action: l.action,
      table_name: l.table_name,
      record_id: l.record_id,
      old_data: l.old_data,
      new_data: l.new_data,
      severity: l.severity ?? 'INFO',
      created_at: l.created_at,
    };
  });
}
