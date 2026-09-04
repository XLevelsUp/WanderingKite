import { adminAuthClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { hasAccess } from '@/lib/access';
import ClientDetailsView from '@/components/dashboard/ClientDetailsView';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HardDrive, Plus } from 'lucide-react';
import ClientBackButton from '@/components/dashboard/ClientBackButton';
import { logger } from '@/lib/logger';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MediaStatusBadge,
  DEVICE_TYPE_LABEL,
  hasBackupRisk,
  NoBackupPill,
  hasUnloggedContent,
  NotLoggedPill,
} from '@/app/(shell)/media-tracker/status';

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

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/clients')) {
    redirect('/');
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
    redirect('/clients');
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
    source: client.source ?? null,
    sourceDetail: client.source_detail ?? null,
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

  // Media Tracker records for this client (graceful: empty if table not yet migrated)
  const { data: mediaRecordsData, error: mediaRecordsError } = await supabase
    .from('media_records')
    .select(
      `
      id, title, status, shoot_date, content_logged_at,
      primary_storage:storage_devices!primary_storage_device_id(id, label, type),
      original_backup:storage_devices!original_backup_device_id(id, label),
      backup_copy:storage_devices!backup_copy_device_id(id, label)
    `
    )
    .eq('client_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (mediaRecordsError) {
    logger.error('Fetch client media records error:', mediaRecordsError);
  }
  const clientMediaRecords = mediaRecordsData ?? [];
  const isEmployeeRole = profile?.role === 'EMPLOYEE';

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

      {/* Media Tracker — this client's tracked shoots */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              Media Records
            </CardTitle>
            <CardDescription className="mt-1">
              Where this client&apos;s footage and backups are stored.
            </CardDescription>
          </div>
          {!isEmployeeRole && (
            <Link href="/media-tracker/new" className="shrink-0">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1.5" />
                Track new shoot
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {clientMediaRecords.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No tracked shoots for this client yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {clientMediaRecords.map((r: any) => (
                <li
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-xl border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/media-tracker/${r.id}`}
                      className="text-sm font-semibold hover:text-primary hover:underline"
                    >
                      {r.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {r.shoot_date
                        ? new Date(r.shoot_date).toLocaleDateString('en-IN')
                        : 'No shoot date'}
                      {r.primary_storage
                        ? ` · ${r.primary_storage.label} (${DEVICE_TYPE_LABEL[r.primary_storage.type] ?? r.primary_storage.type})`
                        : ' · No storage set'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <MediaStatusBadge status={r.status} />
                    {hasBackupRisk(r) && <NoBackupPill />}
                    {hasUnloggedContent(r) && <NotLoggedPill />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
