'use client';

import { useEffect, useRef } from 'react';
import { startSession, pingSession } from '@/actions/session-tracking';
import { getStoredSessionId, setStoredSessionId } from '@/lib/clientSession';

const HEARTBEAT_MS = 60_000;

/**
 * Invisible, mounted once in the dashboard layout. Starts exactly one
 * session row per real login (deduped via sessionStorage across refreshes),
 * then bumps last_active_at on a heartbeat while the tab is visible so
 * session duration is meaningful even if the user just closes the tab
 * instead of clicking Sign Out.
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

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return null;
}
