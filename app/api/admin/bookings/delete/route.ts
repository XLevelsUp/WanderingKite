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
    const bookingId = searchParams.get('id');
    const bookingType = searchParams.get('type'); // 'PHOTOGRAPHY', 'STUDIO', 'RENTAL'

    if (!bookingId || !bookingType) {
      return NextResponse.json({ error: 'Missing booking ID or type' }, { status: 400 });
    }

    let tableName = '';
    if (bookingType === 'PHOTOGRAPHY') tableName = 'photography_bookings';
    else if (bookingType === 'STUDIO') tableName = 'studio_bookings';
    else if (bookingType === 'RENTAL') tableName = 'rental_bookings';
    else {
      return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 });
    }

    // First delete related assignment history for this booking if any
    const { error: assignError } = await adminAuthClient
      .from('assignment_history')
      .delete()
      .eq('booking_id', bookingId);
      
    if (assignError) {
      logger.error('Failed to delete assignment history:', assignError);
    }

    const { error } = await adminAuthClient
      .from(tableName)
      .delete()
      .eq('id', bookingId);

    if (error) {
      logger.error('Failed to delete booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/admin/bookings/delete error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
