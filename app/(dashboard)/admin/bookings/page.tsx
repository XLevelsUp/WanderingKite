import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BookingsList from '@/components/dashboard/BookingsList';

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'SUPER_ADMIN' && profile.role !== 'DEVELOPER')) {
    redirect('/dashboard');
  }

  // Fetch all bookings
  const [photoRes, studioRes, rentalRes, profilesRes] = await Promise.all([
    supabase.from('photography_bookings').select('*, album:album_details(*), client:clients(*)').order('created_at', { ascending: false }),
    supabase.from('studio_bookings').select('*, client:clients(*)').order('created_at', { ascending: false }),
    supabase.from('rental_bookings').select('*, client:clients(*)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, fullName, role, deletedAt, employee_contracts(isActive)').in('role', ['ADMIN', 'SUPER_ADMIN', 'EMPLOYEE']).is('deletedAt', null), // For assignees
  ]);

  const employees = profilesRes.data || [];
  const editors = employees.filter((profile: any) => {
    const contracts = profile.employee_contracts || [];
    const hasActiveContract = contracts.some((c: any) => c.isActive === true);
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
      return contracts.length === 0 || hasActiveContract;
    }
    return hasActiveContract;
  });

  // Fetch assignees
  const { data: assignees } = await supabase.from('booking_assignees').select('*, profile:profiles(*)');

  // Fetch charges
  const { data: charges } = await supabase.from('studio_booking_charges').select('*');

  // Bookings embed the client row via `client:clients(*)`, but PostgREST
  // can't filter a parent row by a column on the embedded relation — so a
  // soft-deleted client's bookings would otherwise still show up here
  // (their client_id row still exists, just flagged). Filter client-side
  // instead, same intent as getClients()'s `is('deleted_at', null)`.
  const isClientActive = (client: any) => !client?.deletedAt;

  const photographyBookings = (photoRes.data || []).filter((b: any) =>
    isClientActive(b.client)
  );
  const studioBookings = (studioRes.data || []).filter((b: any) =>
    isClientActive(b.client)
  );
  const rentalBookings = (rentalRes.data || []).filter((b: any) =>
    isClientActive(b.client)
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Centralized Bookings</h1>
        <p className="text-slate-400">Manage all studio space, photography, and equipment rental bookings.</p>
      </div>
      <BookingsList
        photographyBookings={photographyBookings}
        studioBookings={studioBookings}
        rentalBookings={rentalBookings}
        editors={editors}
        assignees={assignees || []}
        charges={charges || []}
      />
    </div>
  );
}
