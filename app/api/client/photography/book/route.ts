import { auth } from '@/auth';
import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'client') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionType, dateTime, location, notes, peopleCount } = body;

    if (!sessionType || !dateTime || !location) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const proposedTime = new Date(dateTime);
    if (isNaN(proposedTime.getTime())) {
      return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
    }

    // Date validation: cannot book a date in the past
    if (proposedTime.getTime() <= Date.now()) {
      return NextResponse.json({
        error: 'past_date',
        message: 'You cannot schedule a booking in the past.',
      }, { status: 400 });
    }

    const supabase = adminAuthClient;

    // Fetch client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, is_active')
      .eq('email', session.user.email as string)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'client_not_found' }, { status: 404 });
    }

    if (client.is_active === false) {
      return NextResponse.json({
        error: 'deactivated',
        message: 'Your account has been deactivated. Please contact support.',
      }, { status: 403 });
    }

    // Advanced slot scheduling: check 4-hour buffer conflicts for active bookings
    const bufferStart = new Date(proposedTime.getTime() - 4 * 60 * 60 * 1000);
    const bufferEnd = new Date(proposedTime.getTime() + 4 * 60 * 60 * 1000);

    const { data: conflicts, error: conflictError } = await supabase
      .from('photography_bookings')
      .select('id')
      .in('status', ['CONFIRMED', 'PENDING'])
      .gte('date_time', bufferStart.toISOString())
      .lte('date_time', bufferEnd.toISOString());

    if (conflictError) {
      console.error('Buffer conflict check failed:', conflictError);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    const hasConflict = conflicts && conflicts.length > 0;

    // Save photography booking
    const { data: booking, error: insertError } = await supabase
      .from('photography_bookings')
      .insert({
        client_id: client.id,
        session_type: sessionType,
        date_time: proposedTime.toISOString(),
        location,
        notes,
        people_count: peopleCount ? parseInt(peopleCount, 10) : null,
        status: 'PENDING',
        amount_paid: 0,
        advance_paid: 0,
      })
      .select('id')
      .single();

    if (insertError || !booking) {
      console.error('Photography insert failed:', insertError);
      return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookingId: booking.id, hasConflict });
  } catch (error) {
    console.error('POST /api/client/photography/book error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
