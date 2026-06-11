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
    const { equipmentIds, startDate, endDate, purpose } = body;

    if (!equipmentIds || !Array.isArray(equipmentIds) || equipmentIds.length === 0) {
      return NextResponse.json({
        error: 'missing_equipment',
        message: 'At least one equipment must be selected for rentals.',
      }, { status: 400 });
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
    }

    // Validation: cannot book in the past
    if (start.getTime() <= Date.now()) {
      return NextResponse.json({
        error: 'past_date',
        message: 'Rental start date cannot be in the past.',
      }, { status: 400 });
    }

    // Validation: end time must be after start time
    if (end.getTime() <= start.getTime()) {
      return NextResponse.json({
        error: 'invalid_duration',
        message: 'Rental end date must be after the start date.',
      }, { status: 400 });
    }

    const supabase = adminAuthClient;

    // Fetch client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', session.user.email as string)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'client_not_found' }, { status: 404 });
    }

    // Verify all selected equipment exists, is active
    const { data: equipmentList, error: equipError } = await supabase
      .from('equipment')
      .select('id, name')
      .in('id', equipmentIds)
      .eq('available_for_rental', true)
      .neq('status', 'RETIRED');

    if (equipError || !equipmentList || equipmentList.length !== equipmentIds.length) {
      return NextResponse.json({
        error: 'equipment_unavailable',
        message: 'Some of the selected equipment is not available for your chosen dates.',
      }, { status: 400 });
    }

    // Check availability for each selected item
    for (const eqItem of equipmentList) {
      // Get all booking IDs that contain this equipment
      const { data: joinRows, error: joinError } = await supabase
        .from('_RentalBookingToEquipment')
        .select('A')
        .eq('B', eqItem.id);

      if (joinError) {
        console.error(`Error querying join table for ${eqItem.name}:`, joinError);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
      }

      const bookingIds = joinRows ? joinRows.map((r: any) => r.A) : [];

      if (bookingIds.length > 0) {
        // Count how many of these bookings overlap with [start, end] and are active
        const { count, error: overlapError } = await supabase
          .from('rental_bookings')
          .select('*', { count: 'exact', head: true })
          .in('id', bookingIds)
          .in('status', ['PENDING', 'CONFIRMED'])
          .lt('start_date', end.toISOString())
          .gt('end_date', start.toISOString());

        if (overlapError) {
          console.error(`Overlapping rentals check failed for ${eqItem.name}:`, overlapError);
          return NextResponse.json({ error: 'server_error' }, { status: 500 });
        }

        const occupiedCount = count || 0;
        if (occupiedCount >= 1) {
          return NextResponse.json({
            error: 'equipment_sold_out',
            message: `The item "${eqItem.name}" is already booked for the selected dates.`,
          }, { status: 409 });
        }
      }
    }

    // Create rental booking
    const { data: booking, error: insertError } = await supabase
      .from('rental_bookings')
      .insert({
        client_id: client.id,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        purpose,
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (insertError || !booking) {
      console.error('Rental insert failed:', insertError);
      return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
    }

    // Insert join relations (many-to-many relationship)
    const joinRows = equipmentIds.map((id: string) => ({
      A: booking.id,
      B: id,
    }));

    const { error: joinError } = await supabase
      .from('_RentalBookingToEquipment')
      .insert(joinRows);

    if (joinError) {
      console.error('Rental join insertion failed:', joinError);
      // Rollback booking if join fails to prevent orphaned items
      await supabase.from('rental_bookings').delete().eq('id', booking.id);
      return NextResponse.json({ error: 'join_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error('POST /api/client/rentals/book error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
