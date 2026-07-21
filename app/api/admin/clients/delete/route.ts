import { createClient } from '@/lib/supabase/server';
import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { writeAuditLog } from '@/lib/audit';

export async function DELETE(request: Request) {
  try {
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

    if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('id');

    if (!clientId) {
      return NextResponse.json({ error: 'Missing client ID' }, { status: 400 });
    }

    // Soft-delete: set deleted_at and is_active=false on the client row.
    // All related bookings, ID proofs, and history are preserved for audit purposes.
    // The client will be blocked from logging in (is_active=false) and hidden from
    // all admin listings (deleted_at IS NOT NULL filter in getClients()).
    const now = new Date().toISOString();

    const { data: oldRow } = await adminAuthClient
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    const { error: softDeleteError } = await adminAuthClient
      .from('clients')
      .update({
        deletedAt: now,
        is_active: false,
      })
      .eq('id', clientId);

    if (softDeleteError) {
      logger.error('Failed to soft-delete client:', softDeleteError.message);
      return NextResponse.json({ error: softDeleteError.message }, { status: 500 });
    }

    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'DELETE_CLIENT',
      table_name: 'clients',
      record_id: clientId,
      old_data: oldRow,
    });

    logger.info(`Client ${clientId} soft-deleted at ${now}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/admin/clients/delete error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
