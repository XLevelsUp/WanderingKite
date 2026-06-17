import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, bookingId, bookingType, employeeId } = body;

    if (!action || !bookingId || !bookingType || !employeeId) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    if (action === 'ADD') {
      const payload: any = { employee_id: employeeId };
      if (bookingType === 'STUDIO') payload.studio_booking_id = bookingId;
      else if (bookingType === 'PHOTOGRAPHY') payload.photography_booking_id = bookingId;

      const { data: assignee, error } = await supabase
        .from('booking_assignees')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // unique violation
          return NextResponse.json({ error: 'already_assigned' }, { status: 400 });
        }
        logger.error('Insert assignee error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, assignee });
    } else if (action === 'REMOVE') {
      const matchCriteria: any = { employee_id: employeeId };
      if (bookingType === 'STUDIO') matchCriteria.studio_booking_id = bookingId;
      else if (bookingType === 'PHOTOGRAPHY') matchCriteria.photography_booking_id = bookingId;

      const { error } = await supabase
        .from('booking_assignees')
        .delete()
        .match(matchCriteria);

      if (error) {
        logger.error('Delete assignee error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('POST /api/admin/bookings/assignees error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
