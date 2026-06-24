import { adminAuthClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

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

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');
    const type = searchParams.get('type') || 'conflict';

    if (!logId) {
      return NextResponse.json({ error: 'Missing log ID' }, { status: 400 });
    }

    let tableName = '';
    if (type === 'clash') {
      tableName = 'audit_clash_logs';
    } else if (type === 'conflict') {
      tableName = 'studio_booking_conflicts';
    } else {
      return NextResponse.json({ error: 'Invalid log type' }, { status: 400 });
    }

    const { error } = await adminAuthClient
      .from(tableName)
      .delete()
      .eq('id', logId);

    if (error) {
      logger.error('Failed to delete audit log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/admin/audit/delete error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
