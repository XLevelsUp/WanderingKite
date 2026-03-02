/**
 * Audit Helper — writeAuditLog
 *
 * Call this from every server action AFTER a successful mutation.
 * Captures: who, what, when, which record, before/after state, IP, User-Agent.
 *
 * Usage:
 *   import { writeAuditLog } from '@/lib/audit';
 *   await writeAuditLog(supabase, { action: 'CREATE_EMPLOYEE', table_name: 'profiles', record_id: newId, new_data: profile });
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type AuditSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface AuditLogParams {
  action: string; // e.g. 'CREATE_EMPLOYEE', 'ASSIGN_EQUIPMENT', 'DELETE_CLIENT'
  table_name: string; // e.g. 'profiles', 'equipment', 'orders'
  record_id: string; // UUID of the affected row
  old_data?: unknown; // snapshot before change (for updates/deletes)
  new_data?: unknown; // snapshot after change (for creates/updates)
  severity?: AuditSeverity;
  session_id?: string; // optional JWT jti or custom session token
  // Pass the Next.js request headers object if available (Server Actions don't expose Request directly)
  ip_address?: string | null;
  user_agent?: string | null;
}

export async function writeAuditLog(
  supabase: SupabaseClient,
  params: AuditLogParams,
): Promise<void> {
  const {
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    severity = 'INFO',
    session_id,
    ip_address,
    user_agent,
  } = params;

  const { error } = await supabase.from('audit_logs').insert({
    action,
    table_name,
    record_id,
    old_data:
      old_data !== undefined ? (old_data as Record<string, unknown>) : null,
    new_data:
      new_data !== undefined ? (new_data as Record<string, unknown>) : null,
    severity,
    sessionId: session_id ?? null,
    ip_address: ip_address ?? null,
    user_agent: user_agent ?? null,
  });

  if (error) {
    // Never let audit log failure break user-facing operations.
    // Log to server console only — do not throw.
    console.error('[AUDIT] Failed to write audit log:', error.message, {
      action,
      table_name,
      record_id,
    });
  }
}

/**
 * Helper to extract IP and User-Agent from Next.js request headers.
 * Use inside Server Components or Route Handlers where `headers()` is available.
 *
 * Example:
 *   import { headers } from 'next/headers';
 *   const { ip, ua } = getRequestMeta(await headers());
 */
export function getRequestMeta(headersList: Headers): {
  ip: string | null;
  ua: string | null;
} {
  return {
    ip:
      headersList.get('x-forwarded-for') ??
      headersList.get('x-real-ip') ??
      null,
    ua: headersList.get('user-agent') ?? null,
  };
}
