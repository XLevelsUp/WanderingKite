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

  if (!profile || profile.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all bookings
  const [photoRes, studioRes, rentalRes, profilesRes] = await Promise.all([
    supabase.from('photography_bookings').select('*, album:album_details(*), client:clients(*)').order('created_at', { ascending: false }),
    supabase.from('studio_bookings').select('*, client:clients(*)').order('created_at', { ascending: false }),
    supabase.from('rental_bookings').select('*, client:clients(*)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, fullName, role').in('role', ['ADMIN', 'SUPER_ADMIN', 'EMPLOYEE']), // For assignees
  ]);

  // Employee Contracts to filter editors
  const { data: contracts } = await supabase
    .from('employee_contracts')
    .select('profileId, jobTitle, isActive')
    .eq('isActive', true);

  const employees = profilesRes.data || [];
  const editors = employees; // Allow any admin/employee to be assigned

  // Fetch assignees
  const { data: assignees } = await supabase.from('booking_assignees').select('*, profile:profiles(*)');

  // Fetch charges
  const { data: charges } = await supabase.from('studio_booking_charges').select('*');

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Centralized Bookings</h1>
        <p className="text-slate-400">Manage all studio space, photography, and equipment rental bookings.</p>
      </div>
      <BookingsList 
        photographyBookings={photoRes.data || []}
        studioBookings={studioRes.data || []}
        rentalBookings={rentalRes.data || []}
        editors={editors}
        assignees={assignees || []}
        charges={charges || []}
      />
    </div>
  );
}
