import { auth } from '@/auth';
import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'client') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const supabase = adminAuthClient;

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', session.user.email as string)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'client_not_found' }, { status: 404 });
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from('rental_bookings')
      .select('*')
      .eq('client_id', client.id)
      .order('start_date', { ascending: false });

    if (bookingsError) {
      logger.error('Fetch rentals list failed:', bookingsError);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    let formattedBookings: any[] = [];
    if (bookings && bookings.length > 0) {
      const bookingIds = bookings.map((b: any) => b.id);

      const { data: joins, error: joinsError } = await supabase
        .from('_RentalBookingToEquipment')
        .select('*')
        .in('A', bookingIds);

      if (joinsError) {
        logger.error('Fetch rentals list join links failed:', joinsError);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
      }

      const equipmentIds = Array.from(new Set((joins || []).map((j: any) => j.B)));

      let equipmentMap: Record<string, any> = {};
      if (equipmentIds.length > 0) {
        const { data: equipmentList, error: equipError } = await supabase
          .from('equipment')
          .select('id, name, description')
          .in('id', equipmentIds);

        if (equipError) {
          logger.error('Fetch rentals equipment details failed:', equipError);
          return NextResponse.json({ error: 'server_error' }, { status: 500 });
        }

        (equipmentList || []).forEach((eq: any) => {
          equipmentMap[eq.id] = eq;
        });
      }

      formattedBookings = bookings.map((b: any) => {
        const associatedEquipIds = (joins || [])
          .filter((j: any) => j.A === b.id)
          .map((j: any) => j.B);

        const equipments = associatedEquipIds
          .map((id: string) => equipmentMap[id])
          .filter(Boolean)
          .map((eq: any) => ({
            id: eq.id,
            name: eq.name,
            description: eq.description,
          }));

        return {
          id: b.id,
          startDate: b.start_date,
          endDate: b.end_date,
          purpose: b.purpose,
          status: b.status,
          pickupCondition: b.pickup_condition,
          returnCondition: b.return_condition,
          returnedAt: b.returned_at,
          damageCost: b.damage_cost,
          damageDescription: b.damage_description,
          agreementUrl: b.agreement_url,
          equipments,
        };
      });
    }

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    logger.error('GET /api/client/rentals/list error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
