import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
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

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*, client_services(type), photography_bookings(status, date_time, created_at), rental_bookings(status, start_date, created_at), studio_bookings(status, date_time, created_at)')
      .order('createdAt', { ascending: false });

    if (clientsError) {
      logger.error('Fetch admin client list failed:', clientsError);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    const clientList = (clients || []).map((client: any) => {
      // Compute last active date based on client updates and booking transaction records
      const dates = [
        new Date(client.createdAt).getTime(),
        new Date(client.updatedAt).getTime(),
        ...(client.photography_bookings || []).map((b: any) => new Date(b.date_time).getTime()),
        ...(client.photography_bookings || []).map((b: any) => new Date(b.created_at).getTime()),
        ...(client.rental_bookings || []).map((b: any) => new Date(b.start_date).getTime()),
        ...(client.rental_bookings || []).map((b: any) => new Date(b.created_at).getTime()),
        ...(client.studio_bookings || []).map((b: any) => new Date(b.date_time).getTime()),
        ...(client.studio_bookings || []).map((b: any) => new Date(b.created_at).getTime()),
      ];
      const lastActive = new Date(Math.max(...dates));

      const totalBookings =
        (client.photography_bookings?.length || 0) +
        (client.rental_bookings?.length || 0) +
        (client.studio_bookings?.length || 0);

      return {
        id: client.id,
        name: client.name,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        isActive: client.is_active,
        services: (client.client_services || []).map((s: any) => s.type),
        totalBookings,
        lastActive,
        createdAt: client.createdAt,
      };
    });

    return NextResponse.json({ clients: clientList });
  } catch (error) {
    logger.error('GET /api/admin/clients/list error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
