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
      bookingType, // "PHOTOGRAPHY" or "STUDIO"
      bookingId,
      status,
      // Optional album fields for photography shoots
      albumName,
      downloadLink,
    } = body;

    if (!bookingType || !bookingId || !status) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    if (bookingType === 'PHOTOGRAPHY') {
      const { data: updated, error: updateError } = await supabase
        .from('photography_bookings')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        console.error('Photography update error:', updateError);
        return NextResponse.json({ error: 'update_failed' }, { status: 500 });
      }

      // If completing a shoot and album info is provided, create/update album details
      if (status === 'COMPLETED' && albumName) {
        const { data: existingAlbum } = await supabase
          .from('album_details')
          .select('id')
          .eq('booking_id', bookingId)
          .maybeSingle();

        if (existingAlbum) {
          await supabase
            .from('album_details')
            .update({
              name: albumName,
              download_link: downloadLink || null,
              updated_at: new Date().toISOString(),
            })
            .eq('booking_id', bookingId);
        } else {
          await supabase
            .from('album_details')
            .insert({
              booking_id: bookingId,
              name: albumName,
              delivery_date: new Date().toISOString(),
              download_link: downloadLink || null,
            });
        }
      }

      return NextResponse.json({ success: true, booking: updated });
    } else if (bookingType === 'STUDIO') {
      const { data: updated, error: updateError } = await supabase
        .from('studio_bookings')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        console.error('Studio update error:', updateError);
        return NextResponse.json({ error: 'update_failed' }, { status: 500 });
      }

      return NextResponse.json({ success: true, booking: updated });
    } else {
      return NextResponse.json({ error: 'invalid_booking_type' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/admin/bookings/update error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
