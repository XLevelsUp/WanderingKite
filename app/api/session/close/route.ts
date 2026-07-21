import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Best-effort session close, called via navigator.sendBeacon when a tab is
 * closed/hidden (SessionTracker.tsx) — reduces how often a session is left
 * showing "still active" purely because Sign Out was never clicked. Not a
 * guarantee (sendBeacon can still be dropped by the browser), which is why
 * getLoginActivity() also treats long-stale sessions as effectively ended.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Response(null, { status: 204 });

    const body = await request.json().catch(() => null);
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : null;
    if (!sessionId) return new Response(null, { status: 204 });

    const { error } = await supabase.rpc('close_session', {
      p_session_id: sessionId,
    });
    if (error) {
      logger.error('[SESSION] Failed to close session on tab close', error);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error('[SESSION] Unexpected error closing session', error);
    return new Response(null, { status: 204 });
  }
}
