import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';

/**
 * Staff sign-out. Posted to by SignOutButton (rendered in the shell layout
 * footer), which submits a hidden form carrying the activity-tracking
 * sessionId so the session row is closed rather than left showing as still
 * active.
 *
 * This route belongs to apps/admin because Supabase auth is the staff
 * session — the marketing app's customer portal signs out through NextAuth
 * (components/client-auth/ClientSignOutButton) instead. It lived in
 * apps/marketing until the split, which left SignOutButton posting to a
 * route that did not exist in this app.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const formData = await request.formData().catch(() => null);
  const sessionId = formData?.get('sessionId');
  if (typeof sessionId === 'string' && sessionId) {
    const { error } = await supabase.rpc('close_session', {
      p_session_id: sessionId,
    });
    if (error) logger.error('[SESSION] Failed to close session on sign-out', error);
  }

  await supabase.auth.signOut();
  return redirect('/login');
}
