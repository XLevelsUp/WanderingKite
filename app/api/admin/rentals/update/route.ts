import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      bookingId,
      status,
      pickupCondition,
      returnCondition,
      damageCost,
      damageDescription,
      agreementUrl,
    } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    // Check booking existence
    const { data: booking, error: fetchError } = await supabase
      .from('rental_bookings')
      .select('id')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'booking_not_found' }, { status: 404 });
    }

    // Update rental record
    const { data: updated, error: updateError } = await supabase
      .from('rental_bookings')
      .update({
        status,
        pickup_condition: pickupCondition !== undefined ? pickupCondition : undefined,
        return_condition: returnCondition !== undefined ? returnCondition : undefined,
        returned_at: status === 'RETURNED' || status === 'DAMAGED' ? new Date().toISOString() : undefined,
        damage_cost: damageCost !== undefined && damageCost !== null ? parseFloat(damageCost) : undefined,
        damage_description: damageDescription !== undefined ? damageDescription : undefined,
        agreement_url: agreementUrl !== undefined ? agreementUrl : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Rental update failed:', updateError);
      return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('POST /api/admin/rentals/update error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
