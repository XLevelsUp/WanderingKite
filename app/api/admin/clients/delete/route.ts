import { createClient } from '@/lib/supabase/server';
import { adminAuthClient } from '@/lib/supabase/admin';
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
    const clientId = searchParams.get('id');

    if (!clientId) {
      return NextResponse.json({ error: 'Missing client ID' }, { status: 400 });
    }

    // 1. Get all bookings for this client to delete assignments
    const [pBookings, sBookings, rBookings] = await Promise.all([
      adminAuthClient.from('photography_bookings').select('id').eq('client_id', clientId),
      adminAuthClient.from('studio_bookings').select('id').eq('client_id', clientId),
      adminAuthClient.from('rental_bookings').select('id').eq('client_id', clientId),
    ]);

    const bookingIds = [
      ...(pBookings.data || []).map(b => b.id),
      ...(sBookings.data || []).map(b => b.id),
      ...(rBookings.data || []).map(b => b.id),
    ];

    if (bookingIds.length > 0) {
      const { error: assignError } = await adminAuthClient
        .from('assignment_history')
        .delete()
        .in('booking_id', bookingIds);
      if (assignError) logger.error('Failed to delete assignment history:', assignError);
    }

    // 2. Delete Bookings
    await Promise.all([
      adminAuthClient.from('photography_bookings').delete().eq('client_id', clientId),
      adminAuthClient.from('studio_bookings').delete().eq('client_id', clientId),
      adminAuthClient.from('rental_bookings').delete().eq('client_id', clientId),
    ]);

    // 3. Delete ID Proofs
    await adminAuthClient.from('client_id_proofs').delete().eq('client_id', clientId);

    // 4. Finally delete the client
    const { error: clientError } = await adminAuthClient
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (clientError) {
      logger.error('Failed to delete client:', clientError);
      return NextResponse.json({ error: clientError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/admin/clients/delete error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
