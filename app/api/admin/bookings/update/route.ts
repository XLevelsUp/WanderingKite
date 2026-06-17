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

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      bookingType, // "PHOTOGRAPHY" or "STUDIO"
      bookingId,
      status,
      amountPaid,
      advancePaid,
      quotationAmount,
      paymentStatus,
      // Optional album fields for photography shoots
      albumName,
      downloadLink,
      deliveryLink, // Added for new workflow
    } = body;

    if (!bookingType || !bookingId || !status) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const MAX_INT = 2147483647; // fits in standard signed 32-bit integer

    const validateAndRound = (val: any) => {
      if (val === undefined || val === null) return undefined;
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > MAX_INT) {
        throw new Error('invalid_amount');
      }
      return Math.round(num);
    };

    let roundedAmountPaid: number | undefined;
    let roundedAdvancePaid: number | undefined;
    let roundedQuotationAmount: number | undefined;

    try {
      roundedAmountPaid = validateAndRound(amountPaid);
      roundedAdvancePaid = validateAndRound(advancePaid);
      roundedQuotationAmount = validateAndRound(quotationAmount);
    } catch (err) {
      return NextResponse.json({ error: 'invalid_amount_range' }, { status: 400 });
    }

    if (bookingType === 'PHOTOGRAPHY') {
      // 1. Fetch current booking details to preserve notes and metadata
      const { data: booking, error: fetchErr } = await supabase
        .from('photography_bookings')
        .select('notes')
        .eq('id', bookingId)
        .single();

      if (fetchErr) {
        logger.error('Fetch photography booking error:', fetchErr);
        return NextResponse.json({ error: 'booking_not_found' }, { status: 404 });
      }

      const { userNotes, metadata } = parseNotesMetadata(booking.notes || '');

      if (roundedQuotationAmount !== undefined) metadata.quotationAmount = roundedQuotationAmount;
      if (paymentStatus !== undefined) metadata.paymentStatus = paymentStatus;

      if (status === 'COMPLETED' && !metadata.completedAt) metadata.completedAt = new Date().toISOString();
      if (status === 'IN_EDITING' && !metadata.inEditingAt) metadata.inEditingAt = new Date().toISOString();
      if (status === 'HANDED_OVER' && !metadata.handedOverAt) metadata.handedOverAt = new Date().toISOString();
      
      const serializedNotes = serializeNotesMetadata(userNotes, metadata);

      const updatePayload: any = {
        status,
        updated_at: new Date().toISOString(),
        notes: serializedNotes,
      };

      if (deliveryLink !== undefined) updatePayload.delivery_link = deliveryLink;

      if (roundedAmountPaid !== undefined) {
        updatePayload.amount_paid = roundedAmountPaid;
      }
      if (roundedAdvancePaid !== undefined) {
        updatePayload.advance_paid = roundedAdvancePaid;
      }

      const { data: updated, error: updateError } = await supabase
        .from('photography_bookings')
        .update(updatePayload)
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        logger.error('Photography update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
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
      // 1. Fetch current booking details to preserve notes and metadata
      const { data: booking, error: fetchErr } = await supabase
        .from('studio_bookings')
        .select('notes')
        .eq('id', bookingId)
        .single();

      if (fetchErr) {
        logger.error('Fetch studio booking error:', fetchErr);
        return NextResponse.json({ error: 'booking_not_found' }, { status: 404 });
      }

      const { userNotes, metadata } = parseNotesMetadata(booking.notes || '');

      if (roundedQuotationAmount !== undefined) metadata.quotationAmount = roundedQuotationAmount;
      if (paymentStatus !== undefined) metadata.paymentStatus = paymentStatus;
      if (roundedAdvancePaid !== undefined) metadata.advancePaid = roundedAdvancePaid;

      if (status === 'COMPLETED' && !metadata.completedAt) metadata.completedAt = new Date().toISOString();
      if (status === 'IN_EDITING' && !metadata.inEditingAt) metadata.inEditingAt = new Date().toISOString();
      if (status === 'HANDED_OVER' && !metadata.handedOverAt) metadata.handedOverAt = new Date().toISOString();

      const serializedNotes = serializeNotesMetadata(userNotes, metadata);

      const updatePayload: any = {
        status,
        updated_at: new Date().toISOString(),
        notes: serializedNotes,
      };

      if (deliveryLink !== undefined) updatePayload.delivery_link = deliveryLink;

      if (roundedAmountPaid !== undefined) {
        updatePayload.amount_paid = roundedAmountPaid;
      }

      const { data: updated, error: updateError } = await supabase
        .from('studio_bookings')
        .update(updatePayload)
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        logger.error('Studio update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, booking: updated });
    } else if (bookingType === 'RENTAL') {
      const updatePayload: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'RETURNED' && body.returnedAt !== undefined) {
        updatePayload.returned_at = body.returnedAt;
      }

      const { data: updated, error: updateError } = await supabase
        .from('rental_bookings')
        .update(updatePayload)
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        logger.error('Rental update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, booking: updated });
    } else {
      return NextResponse.json({ error: 'invalid_booking_type' }, { status: 400 });
    }
  } catch (error) {
    logger.error('POST /api/admin/bookings/update error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// Helpers for parsing/serializing metadata in notes field
function parseNotesMetadata(notes: string | null): { userNotes: string; metadata: any } {
  if (!notes) return { userNotes: '', metadata: {} };
  const marker = '\n---METADATA---\n';
  const parts = notes.split(marker);
  if (parts.length > 1) {
    try {
      const metadata = JSON.parse(parts[1]);
      return { userNotes: parts[0], metadata };
    } catch (e) {
      // Ignore parsing error
    }
  }
  return { userNotes: notes, metadata: {} };
}

function serializeNotesMetadata(userNotes: string, metadata: any): string {
  const marker = '\n---METADATA---\n';
  return `${userNotes}${marker}${JSON.stringify(metadata)}`;
}
