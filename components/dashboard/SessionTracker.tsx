'use client';

import { useEffect, useRef } from 'react';
import { startSession, pingSession } from '@/actions/session-tracking';
import { getStoredSessionId, setStoredSessionId } from '@/lib/clientSession';

const HEARTBEAT_MS = 60_000;
const CLOSE_URL = '/api/session/close';

/**
 * Invisible, mounted once in the dashboard layout. Starts exactly one
 * session row per real login (deduped via sessionStorage across refreshes),
 * then bumps last_active_at on a heartbeat while the tab is visible so
 * session duration is meaningful even if the user just closes the tab
 * instead of clicking Sign Out.
 *
 * Best-effort close on real tab/page teardown (pagehide) via sendBeacon —
 * NOT on visibilitychange, since that also fires for a simple tab-switch
 * and closing the session there would wrongly freeze duration if the user
 * comes right back.
 */
export function SessionTracker() {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const existing = getStoredSessionId();
      if (existing) {
        sessionIdRef.current = existing;
        return;
      }
      const id = await startSession();
      if (!cancelled && id) {
        sessionIdRef.current = id;
        setStoredSessionId(id);
      }
    };
    init();

    const heartbeat = () => {
      if (document.visibilityState === 'visible' && sessionIdRef.current) {
        pingSession(sessionIdRef.current);
      }
    };
    const interval = setInterval(heartbeat, HEARTBEAT_MS);

    const handlePageHide = () => {
      if (!sessionIdRef.current || !navigator.sendBeacon) return;
      const blob = new Blob([JSON.stringify({ sessionId: sessionIdRef.current })], {
        type: 'application/json',
      });
      navigator.sendBeacon(CLOSE_URL, blob);
    };
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  return null;
}
