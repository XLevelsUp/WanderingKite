import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';

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
