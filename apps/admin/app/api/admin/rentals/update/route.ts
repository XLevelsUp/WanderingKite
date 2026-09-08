import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

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

    let roundedDamageCost: number | undefined | null = undefined;
    if (damageCost !== undefined && damageCost !== null) {
      const num = Number(damageCost);
      const MAX_INT = 2147483647;
      if (isNaN(num) || num < 0 || num > MAX_INT) {
        return NextResponse.json({ error: 'invalid_amount_range' }, { status: 400 });
      }
      roundedDamageCost = Math.round(num);
    } else if (damageCost === null) {
      roundedDamageCost = null;
    }

    // Update rental record
    const { data: updated, error: updateError } = await supabase
      .from('rental_bookings')
      .update({
        status,
        pickup_condition: pickupCondition !== undefined ? pickupCondition : undefined,
        return_condition: returnCondition !== undefined ? returnCondition : undefined,
        returned_at: status === 'RETURNED' || status === 'DAMAGED' ? new Date().toISOString() : undefined,
        damage_cost: roundedDamageCost !== undefined ? roundedDamageCost : undefined,
        damage_description: damageDescription !== undefined ? damageDescription : undefined,
        agreement_url: agreementUrl !== undefined ? agreementUrl : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      logger.error('Rental update failed:', updateError);
      return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    logger.error('POST /api/admin/rentals/update error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
