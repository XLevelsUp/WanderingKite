import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // Verify staff permissions
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, status, rejectReason } = body;

    if (!clientId || !status) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    // Verify ID proof exists
    const { data: idProof, error: fetchError } = await supabase
      .from('client_id_proofs')
      .select('id')
      .eq('client_id', clientId)
      .maybeSingle();

    if (fetchError || !idProof) {
      return NextResponse.json({ error: 'id_proof_not_found' }, { status: 404 });
    }

    // Update ID proof status
    const { data: updated, error: updateError } = await supabase
      .from('client_id_proofs')
      .update({
        status,
        reject_reason: status === 'REJECTED' ? rejectReason : null,
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', clientId)
      .select()
      .single();

    if (updateError) {
      logger.error('ID verification update error:', updateError);
      return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, idProof: updated });
  } catch (error) {
    logger.error('POST /api/admin/id-proof/verify error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
