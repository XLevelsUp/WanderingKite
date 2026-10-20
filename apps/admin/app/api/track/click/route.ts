import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

interface ClickEventPayload {
  label: string;
  path: string;
  elementTag?: string;
}

const MAX_BATCH_SIZE = 200;

/**
 * Ingests batched click events from the global ClickTracker. Invoked via
 * fetch(keepalive) on a timer and navigator.sendBeacon on tab close — both
 * need a plain fetchable URL, hence a Route Handler rather than a Server
 * Action. user_id always comes from the verified session, never the client.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Beacon calls have no way to surface an error — fail silently.
    if (!user) return new Response(null, { status: 204 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role === 'DEVELOPER') return new Response(null, { status: 204 });

    const body = await request.json().catch(() => null);
    const events: ClickEventPayload[] = Array.isArray(body?.events)
      ? body.events
      : [];
    if (events.length === 0) return new Response(null, { status: 204 });

    const sessionId =
      typeof body?.sessionId === 'string' ? body.sessionId : null;

    const rows = events.slice(0, MAX_BATCH_SIZE).map((e) => ({
      user_id: user.id,
      session_id: sessionId,
      label: String(e.label ?? '').slice(0, 200),
      path: String(e.path ?? '').slice(0, 300),
      element_tag: e.elementTag ? String(e.elementTag).slice(0, 20) : null,
    }));

    const { error } = await supabase.from('click_events').insert(rows);
    if (error) {
      logger.error('[CLICK_TRACK] Failed to insert click events', error);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error('[CLICK_TRACK] Unexpected error', error);
    return new Response(null, { status: 204 });
  }
}
