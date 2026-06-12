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
      .from('photography_bookings')
      .select('*, album_details(*)')
      .eq('client_id', client.id)
      .order('date_time', { ascending: false });

    if (bookingsError) {
      console.error('Fetch photography list failed:', bookingsError);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    const formattedBookings = await Promise.all(
      (bookings || []).map(async (b: any) => {
        const albumObj = Array.isArray(b.album_details) ? b.album_details[0] : b.album_details;
        let signedUrl = null;

        if (albumObj && albumObj.download_link) {
          if (albumObj.download_link.startsWith('http://') || albumObj.download_link.startsWith('https://')) {
            signedUrl = albumObj.download_link;
          } else {
            // Generate a secure, temporary 1-hour signed URL from private bucket "albums"
            const { data, error } = await supabase.storage
              .from('albums')
              .createSignedUrl(albumObj.download_link, 3600);
            if (!error && data) {
              signedUrl = data.signedUrl;
            } else {
              console.error('Failed to generate signed URL for album:', error);
              signedUrl = albumObj.download_link; // fallback to raw path if signing fails
            }
          }
        }

        return {
          id: b.id,
          sessionType: b.session_type,
          dateTime: b.date_time,
          location: b.location,
          notes: b.notes,
          peopleCount: b.people_count,
          status: b.status,
          amountPaid: b.amount_paid,
          advancePaid: b.advance_paid,
          album: albumObj
            ? {
                id: albumObj.id,
                name: albumObj.name,
                deliveryDate: albumObj.delivery_date,
                downloadLink: signedUrl,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('GET /api/client/photography/list error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
