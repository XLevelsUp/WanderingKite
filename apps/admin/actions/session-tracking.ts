'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getRequestMeta } from '@/lib/audit';
import { logger } from '@/lib/logger';

/**
 * Creates a new session row for the current user and returns its id.
 * Called once per real login (client dedupes refreshes via sessionStorage).
 * Never throws — session tracking must not block the dashboard from loading.
 */
export async function startSession(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role === 'DEVELOPER') return null;

  const { ip, ua } = getRequestMeta(await headers());

  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: user.id,
      ip_address: ip,
      user_agent: ua,
    })
    .select('id')
    .single();

  if (error) {
    logger.error('[SESSION] Failed to start session', error);
    return null;
  }
  return data.id;
}

/** Bumps last_active_at for an open session — called on a heartbeat interval. */
export async function pingSession(sessionId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('heartbeat_session', {
    p_session_id: sessionId,
  });
  if (error) {
    logger.error('[SESSION] Failed to ping session', error);
  }
}

/** Marks a session as closed — called from the sign-out flow. */
export async function endSession(sessionId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('close_session', {
    p_session_id: sessionId,
  });
  if (error) {
    logger.error('[SESSION] Failed to close session', error);
  }
}
