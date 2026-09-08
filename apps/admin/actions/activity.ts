'use server';

import { adminAuthClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/** Only developer accounts may read staff activity data — mirrors the audit-logs page gate. */
async function requireDeveloper() {
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

  if (!profile || profile.role !== 'DEVELOPER') {
    throw new Error('Forbidden');
  }
}

export interface ActivityQuery {
  /** Only rows from the last N days. Omit/undefined = all time. */
  days?: number;
  limit?: number;
}

const DEFAULT_LIMIT = 100;

/** A session with no heartbeat in 3x the client's 60s interval is treated
 * as ended even without an explicit sign-out — sendBeacon-on-tab-close is
 * best-effort and can be dropped by the browser, so this is the fallback
 * that keeps "still active" from lying indefinitely. */
const STALE_AFTER_SECONDS = 180;

/** Coarse UA sniffing for display only — "Chrome on Windows" etc. Not meant
 * to be precise, just enough to spot an unfamiliar browser/device at a glance. */
function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown device';

  let browser = 'Unknown browser';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) browser = 'Chrome';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os|macintosh/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return `${browser} on ${os}`;
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
  device_label: string;
  duration_seconds: number;
  /** 'signed_out' = explicit Sign Out; 'active' = heartbeat within the last
   * 3 min; 'stale' = no heartbeat in 3+ min and never signed out — treated
   * as effectively ended, not truly "still active." */
  status: 'signed_out' | 'active' | 'stale';
}

export async function getLoginActivity(
  query: ActivityQuery = {}
): Promise<LoginActivityRow[]> {
  await requireDeveloper();
  const limit = query.limit ?? DEFAULT_LIMIT;

  let dbQuery = adminAuthClient
    .from('user_sessions')
    .select('*')
    .order('login_at', { ascending: false })
    .limit(limit);

  if (query.days) {
    dbQuery = dbQuery.gte(
      'login_at',
      new Date(Date.now() - query.days * 86_400_000).toISOString()
    );
  }

  const { data: sessions, error } = await dbQuery;

  if (error || !sessions) {
    if (error) logger.error('Failed to fetch login activity:', error);
    return [];
  }

  const userIds = [...new Set(sessions.map((s) => s.user_id).filter(Boolean))];
  const { data: profiles } = await adminAuthClient
    .from('profiles')
    .select('id, email, "fullName"')
    .in('id', userIds);

  const now = Date.now();

  return sessions.map((s) => {
    const profile = profiles?.find((p) => p.id === s.user_id);
    const lastActiveMs = new Date(s.last_active_at).getTime();
    const isStale = !s.logout_at && now - lastActiveMs > STALE_AFTER_SECONDS * 1000;
    const status: LoginActivityRow['status'] = s.logout_at
      ? 'signed_out'
      : isStale
        ? 'stale'
        : 'active';

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
      device_label: parseUserAgent(s.user_agent),
      duration_seconds: durationSeconds,
      status,
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

/** ~5% chance per call — self-maintains retention without needing pg_cron.
 * See cleanup_old_click_events() in migration 00046. */
function maybeCleanupOldClickEvents() {
  if (Math.random() < 0.05) {
    adminAuthClient.rpc('cleanup_old_click_events').then(({ error }) => {
      if (error) logger.error('Failed to clean up old click events:', error);
    });
  }
}

export async function getClickEvents(
  query: ActivityQuery = {}
): Promise<ClickEventRow[]> {
  await requireDeveloper();
  maybeCleanupOldClickEvents();
  const limit = query.limit ?? DEFAULT_LIMIT;

  let dbQuery = adminAuthClient
    .from('click_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (query.days) {
    dbQuery = dbQuery.gte(
      'created_at',
      new Date(Date.now() - query.days * 86_400_000).toISOString()
    );
  }

  const { data: events, error } = await dbQuery;

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

export async function getClickLeaderboard(
  days?: number
): Promise<ClickLeaderboardRow[]> {
  await requireDeveloper();

  const { data, error } = await adminAuthClient.rpc('get_click_leaderboard', {
    p_days: days ?? null,
  });

  if (error || !data) {
    if (error) logger.error('Failed to fetch click leaderboard:', error);
    return [];
  }

  return data.map((row: any) => ({
    label: row.label,
    path: row.path,
    count: Number(row.click_count),
  }));
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
export async function getAuditLog(
  query: ActivityQuery = {}
): Promise<AuditLogRow[]> {
  await requireDeveloper();
  const limit = query.limit ?? DEFAULT_LIMIT;

  let dbQuery = adminAuthClient
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (query.days) {
    dbQuery = dbQuery.gte(
      'created_at',
      new Date(Date.now() - query.days * 86_400_000).toISOString()
    );
  }

  const { data: logs, error } = await dbQuery;

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
