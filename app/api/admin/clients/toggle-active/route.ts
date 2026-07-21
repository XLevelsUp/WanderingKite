import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { writeAuditLog } from '@/lib/audit';

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

    if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, isActive } = body;

    if (!clientId || isActive === undefined) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .maybeSingle();

    if (fetchError || !client) {
      return NextResponse.json({ error: 'client_not_found' }, { status: 404 });
    }

    // Toggle client isActive status in Supabase clients table
    const { data: updated, error: updateError } = await supabase
      .from('clients')
      .update({
        is_active: !!isActive,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      logger.error('Toggle active status error:', updateError);
      return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    }

    await writeAuditLog(supabase, {
      user_id: user.id,
      action: isActive ? 'ACTIVATE_CLIENT' : 'DEACTIVATE_CLIENT',
      table_name: 'clients',
      record_id: clientId,
      new_data: { is_active: !!isActive },
    });

    return NextResponse.json({
      success: true,
      client: {
        id: updated.id,
        name: updated.name,
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        dateOfBirth: updated.date_of_birth,
        gender: updated.gender,
        isActive: updated.is_active,
      },
    });
  } catch (error) {
    logger.error('POST /api/admin/clients/toggle-active error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
