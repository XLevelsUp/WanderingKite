import { adminAuthClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { hasAccess } from '@/lib/access';
import ClientDetailsView from '@/components/dashboard/ClientDetailsView';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import ClientBackButton from '@/components/dashboard/ClientBackButton';
import { logger } from '@/lib/logger';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Verify staff permissions
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/dashboard/clients')) {
    redirect('/dashboard');
  }

  // Fetch client details, profiles, assignees, and charges
  const [{ data: client, error: clientError }, profilesRes, assigneesRes, chargesRes] = await Promise.all([
    supabase
      .from('clients')
      .select('*, client_services(type), client_id_proofs(*), photography_bookings(*, album_details(*)), rental_bookings(*, equipment(*)), studio_bookings(*, equipment(*))')
      .eq('id', id)
      .single(),
    supabase.from('profiles').select('id, fullName, role, deletedAt, employee_contracts(isActive)').in('role', ['ADMIN', 'SUPER_ADMIN', 'EMPLOYEE']).is('deletedAt', null),
    supabase.from('booking_assignees').select('*, profile:profiles(*)'),
    supabase.from('studio_booking_charges').select('*'),
  ]);

  if (clientError || !client) {
    logger.error('Fetch client details error:', clientError);
    redirect('/dashboard/clients');
  }

  const editors = (profilesRes.data || []).filter((profile: any) => {
    const contracts = profile.employee_contracts || [];
    const hasActiveContract = contracts.some((c: any) => c.isActive === true);
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
      return contracts.length === 0 || hasActiveContract;
    }
    return hasActiveContract;
  });

  // Generate secure temporary signed URL for the client ID proof
  const idProofObj = Array.isArray(client.client_id_proofs) 
    ? client.client_id_proofs[0] 
    : client.client_id_proofs;

  let signedIdProofUrl = '';
  if (idProofObj && idProofObj.file_url) {
    const { data, error } = await adminAuthClient.storage
      .from('id-proofs')
      .createSignedUrl(idProofObj.file_url, 3600); // 1-hour expiry

    if (!error && data) {
      signedIdProofUrl = data.signedUrl;
    } else {
      signedIdProofUrl = idProofObj.file_url;
    }
  }

  const clientProfile = {
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
  };

  const servicePriority: Record<string, number> = {
    PHOTOGRAPHY: 1,
    STUDIO_SPACE: 2,
    RENTALS: 3,
  };
  const initialServices = (client.client_services || [])
    .map((s: any) => s.type)
    .sort((a: string, b: string) => (servicePriority[a] || 99) - (servicePriority[b] || 99));
  const initialIdProof = idProofObj
    ? {
        id: idProofObj.id,
        idType: idProofObj.id_type,
        status: idProofObj.status,
        rejectReason: idProofObj.reject_reason,
        fileUrl: signedIdProofUrl,
      }
    : null;

  // Format photography bookings
  const photographyBookingsSerialized = (client.photography_bookings || [])
    .map((b: any) => {
      const albumObj = Array.isArray(b.album_details) ? b.album_details[0] : b.album_details;
      return {
        id: b.id,
        sessionType: b.session_type,
        dateTime: b.date_time,
        location: b.location,
        notes: b.notes,
        peopleCount: b.people_count,
        status: b.status,
        amountPaid: b.amount_paid ? b.amount_paid.toString() : '0',
        advancePaid: b.advance_paid ? b.advance_paid.toString() : '0',
        createdAt: b.created_at,
        delivery_link: b.delivery_link,
        album: albumObj
          ? {
              id: albumObj.id,
              name: albumObj.name,
              deliveryDate: albumObj.delivery_date,
              downloadLink: albumObj.download_link,
            }
          : null,
      };
    })
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Format rentals
  const rentalBookingsSerialized = (client.rental_bookings || [])
    .map((b: any) => ({
      id: b.id,
      startDate: b.start_date,
      endDate: b.end_date,
      purpose: b.purpose,
      status: b.status,
      pickupCondition: b.pickup_condition,
      returnCondition: b.return_condition,
      returnedAt: b.returned_at,
      damageCost: b.damage_cost ? b.damage_cost.toString() : null,
      damageDescription: b.damage_description,
      agreementUrl: b.agreement_url,
      createdAt: b.created_at,
      equipments: (b.equipment || []).map((eq: any) => ({ id: eq.id, name: eq.name })),
    }))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Format studio bookings
  const studioBookingsSerialized = (client.studio_bookings || [])
    .map((b: any) => ({
      id: b.id,
      dateTime: b.date_time,
      durationHours: b.duration_hours,
      purpose: b.purpose,
      status: b.status,
      amountPaid: b.amount_paid ? b.amount_paid.toString() : '0',
      additionalCharges: b.additional_charges ? b.additional_charges.toString() : '0',
      notes: b.notes,
      createdAt: b.created_at,
      delivery_link: b.delivery_link,
      equipments: (b.equipment || []).map((eq: any) => ({ id: eq.id, name: eq.name })),
    }))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClientBackButton />
      </div>

      <ClientDetailsView
        client={clientProfile}
        services={initialServices}
        idProof={initialIdProof}
        photographyBookings={photographyBookingsSerialized}
        rentalBookings={rentalBookingsSerialized}
        studioBookings={studioBookingsSerialized}
        editors={editors}
        assignees={assigneesRes.data || []}
        charges={chargesRes.data || []}
      />
    </div>
  );
}
