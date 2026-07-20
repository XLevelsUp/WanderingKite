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

    if (!profile || (profile.role !== 'SUPER_ADMIN' && profile.role !== 'DEVELOPER')) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { bookingId, chargeType, description, amount } = body;

    if (!bookingId || !chargeType || amount === undefined) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: 'invalid_amount' }, { status: 400 });
    }

    // Insert the line item
    const { data: charge, error } = await supabase
      .from('studio_booking_charges')
      .insert({
        booking_id: bookingId,
        charge_type: chargeType, // 'EXTENDED_HOURS', 'EXTRA_EQUIPMENT', 'MISC'
        description: description || null,
        amount: parsedAmount,
      })
      .select()
      .single();

    if (error) {
      logger.error('Insert booking charge error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the parent booking's additional_charges (summing them up)
    const { data: studioBooking, error: fetchErr } = await supabase
      .from('studio_bookings')
      .select('additional_charges')
      .eq('id', bookingId)
      .single();

    if (!fetchErr && studioBooking) {
      const newAdditionalCharges = Number(studioBooking.additional_charges || 0) + parsedAmount;
      await supabase
        .from('studio_bookings')
        .update({ additional_charges: newAdditionalCharges })
        .eq('id', bookingId);
    }

    return NextResponse.json({ success: true, charge });
  } catch (error) {
    logger.error('POST /api/admin/bookings/charges error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
