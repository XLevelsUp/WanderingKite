/**
 * Client-only helpers for the activity-tracking session id.
 * sessionStorage naturally clears on tab close, so a stored id is scoped to
 * exactly one real login — surviving page refreshes/navigation but not
 * carrying over into a new tab or browser restart.
 */
const SESSION_KEY = 'wk_session_id';

export function getStoredSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function setStoredSessionId(id: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, id);
}

export function clearStoredSessionId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}
