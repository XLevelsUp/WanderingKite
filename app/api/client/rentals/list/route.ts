import { auth } from '@/auth';
import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

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
      .select('*, equipment(*)')
      .eq('client_id', client.id)
      .order('start_date', { ascending: false });

    if (bookingsError) {
      console.error('Fetch rentals list failed:', bookingsError);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    const formattedBookings = (bookings || []).map((b: any) => {
      const equipments = (b.equipment || []).map((eq: any) => ({
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

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('GET /api/client/rentals/list error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
