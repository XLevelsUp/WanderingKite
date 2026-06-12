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
    const { dateTime, durationHours, purpose, equipmentIds, notes } = body;

    if (!dateTime || !durationHours || !purpose) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    if (!equipmentIds || !Array.isArray(equipmentIds) || equipmentIds.length === 0) {
      return NextResponse.json({
        error: 'missing_equipment',
        message: 'At least one equipment item must be selected for studio bookings.',
      }, { status: 400 });
    }

    const start = new Date(dateTime);
    const duration = parseInt(durationHours, 10);

    if (isNaN(start.getTime()) || isNaN(duration) || duration <= 0) {
      return NextResponse.json({ error: 'invalid_inputs' }, { status: 400 });
    }

    // Validation: cannot book in past
    if (start.getTime() <= Date.now()) {
      return NextResponse.json({
        error: 'past_date',
        message: 'Studio booking date and time cannot be in the past.',
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

    // Advanced slot scheduling: check overlaps + 30-minute turnaround buffer
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000 + 30 * 60 * 1000);

    // Fetch active bookings within a 24-hour buffer window (prevents overnight overlaps)
    const bufferStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const bufferEnd = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const { data: bookingsInWindow, error: rangeError } = await supabase
      .from('studio_bookings')
      .select('*')
      .in('status', ['CONFIRMED', 'PENDING'])
      .gte('date_time', bufferStart.toISOString())
      .lte('date_time', bufferEnd.toISOString());

    if (rangeError) {
      console.error('Fetch studio bookings in buffer window failed:', rangeError);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    const hasOverlap = (bookingsInWindow || []).some((b: any) => {
      const bStart = new Date(b.date_time).getTime();
      const bEnd = bStart + b.duration_hours * 60 * 60 * 1000 + 30 * 60 * 1000;
      const pStart = start.getTime();
      const pEnd = end.getTime();

      return pStart < bEnd && pEnd > bStart;
    });

    if (hasOverlap) {
      return NextResponse.json({
        error: 'booking_conflict',
        message: 'This time slot is already booked. Please choose a different date or time.',
      }, { status: 409 });
    }

    // Verify studio equipment exists and is active
    const { data: equipmentList, error: equipError } = await supabase
      .from('equipment')
      .select('id')
      .in('id', equipmentIds)
      .eq('available_for_studio', true)
      .neq('status', 'RETIRED');

    if (equipError || !equipmentList || equipmentList.length !== equipmentIds.length) {
      return NextResponse.json({
        error: 'equipment_unavailable',
        message: 'Selected studio equipment is currently unavailable.',
      }, { status: 400 });
    }

    // Create studio booking
    const { data: booking, error: insertError } = await supabase
      .from('studio_bookings')
      .insert({
        client_id: client.id,
        date_time: start.toISOString(),
        duration_hours: duration,
        purpose,
        status: 'PENDING',
        amount_paid: 0,
        additional_charges: 0,
        notes,
      })
      .select('id')
      .single();

    if (insertError || !booking) {
      console.error('Studio insert failed:', insertError);
      return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
    }

    // Insert join relations (many-to-many relationship)
    const joinRows = equipmentIds.map((id: string) => ({
      A: booking.id,
      B: id,
    }));

    const { error: joinError } = await supabase
      .from('_StudioBookingToEquipment')
      .insert(joinRows);

    if (joinError) {
      console.error('Studio join insertion failed:', joinError);
      // Rollback
      await supabase.from('studio_bookings').delete().eq('id', booking.id);
      return NextResponse.json({ error: 'join_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error('POST /api/client/studio/book error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
