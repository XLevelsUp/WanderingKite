import { adminAuthClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch client with services, ID proofs, bookings, and catalog relations
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*, client_services(type), client_id_proofs(*), photography_bookings(*, album_details(*)), rental_bookings(*, equipment(*)), studio_bookings(*, equipment(*))')
      .eq('id', id)
      .single();

    if (clientError || !client) {
      logger.error('Fetch admin client detail error:', clientError);
      return NextResponse.json({ error: 'client_not_found' }, { status: 404 });
    }

    // Format photo bookings with signed URL resolution
    const photographyBookings = await Promise.all(
      (client.photography_bookings || []).map(async (b: any) => {
        const albumObj = Array.isArray(b.album_details) ? b.album_details[0] : b.album_details;
        let signedUrl = null;

        if (albumObj && albumObj.download_link) {
          if (albumObj.download_link.startsWith('http://') || albumObj.download_link.startsWith('https://')) {
            signedUrl = albumObj.download_link;
          } else {
            const { data, error } = await adminAuthClient.storage
              .from('albums')
              .createSignedUrl(albumObj.download_link, 3600);
            if (!error && data) {
              signedUrl = data.signedUrl;
            } else {
              logger.error('Failed to generate signed URL for admin album download:', error);
              signedUrl = albumObj.download_link;
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
    photographyBookings.sort((a: any, b: any) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    // Format rentals
    const rentalBookings = (client.rental_bookings || [])
      .map((b: any) => ({
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
        equipments: (b.equipment || []).map((eq: any) => ({
          id: eq.id,
          name: eq.name,
        })),
      }))
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    // Format studio bookings
    const studioBookings = (client.studio_bookings || [])
      .map((b: any) => ({
        id: b.id,
        dateTime: b.date_time,
        durationHours: b.duration_hours,
        purpose: b.purpose,
        status: b.status,
        amountPaid: b.amount_paid,
        additionalCharges: b.additional_charges,
        notes: b.notes,
        equipments: (b.equipment || []).map((eq: any) => ({
          id: eq.id,
          name: eq.name,
        })),
      }))
      .sort((a: any, b: any) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    // Generate secure temporary signed URL for the client ID proof
    const idProofObj = Array.isArray(client.client_id_proofs) 
      ? client.client_id_proofs[0] 
      : client.client_id_proofs;

    let signedIdProofUrl = null;
    if (idProofObj && idProofObj.file_url) {
      const { data, error } = await adminAuthClient.storage
        .from('id-proofs')
        .createSignedUrl(idProofObj.file_url, 3600); // 1-hour expiry

      if (!error && data) {
        signedIdProofUrl = data.signedUrl;
      }
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        dateOfBirth: client.date_of_birth,
        gender: client.gender,
        isActive: client.is_active,
        createdAt: client.createdAt,
      },
      services: (client.client_services || []).map((s: any) => s.type),
      idProof: idProofObj
        ? {
            id: idProofObj.id,
            idType: idProofObj.id_type,
            status: idProofObj.status,
            rejectReason: idProofObj.reject_reason,
            fileUrl: signedIdProofUrl || idProofObj.file_url,
          }
        : null,
      photographyBookings,
      rentalBookings,
      studioBookings,
    });
  } catch (error) {
    logger.error('GET /api/admin/clients/[id] error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
