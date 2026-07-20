'use server';

import { adminAuthClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

async function requireDeveloper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'DEVELOPER') {
    throw new Error('Forbidden');
  }
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile.role)) {
    throw new Error('Forbidden');
  }
}

export async function getAuditClashLogs() {
  // Only developer accounts may read this — mirrors the audit-logs page gate.
  await requireDeveloper();

  // Use admin client to bypass RLS
  const { data: logs, error } = await adminAuthClient
    .from('audit_clash_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !logs || logs.length === 0) {
    if (error) logger.error('Failed to fetch audit clash logs:', error);
    return [];
  }

  // Fetch user profiles for all unique attempted_by IDs
  const userIds = [...new Set(logs.map((l) => l.attempted_by).filter(Boolean))];
  const { data: profiles } = await adminAuthClient
    .from('profiles')
    .select('id, email, "fullName"')
    .in('id', userIds);

  // Fetch equipment names for all unique equipment IDs
  const eqIds = [...new Set(logs.map((l) => l.equipment_id).filter(Boolean))];
  const { data: equipment } = await adminAuthClient
    .from('equipment')
    .select('id, name, "serialNumber"')
    .in('id', eqIds);

  // Merge everything into a flat object for the UI
  return logs.map((log) => {
    const profile = profiles?.find((p) => p.id === log.attempted_by);
    const eq = equipment?.find((e) => e.id === log.equipment_id);
    return {
      ...log,
      user_name: profile?.fullName || null,
      user_email: profile?.email || null,
      equipment_name: eq?.name || null,
      equipment_serial: eq?.serialNumber || null,
    };
  });
}

export async function getStudioBookingConflicts() {
  // Booking conflict resolution is an operational task for ADMIN/SUPER_ADMIN/
  // DEVELOPER, separate from the developer-only audit-logs page.
  await requireAdmin();

  // Use admin client to bypass RLS
  const { data: conflicts, error } = await adminAuthClient
    .from('studio_booking_conflicts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !conflicts) {
    if (error) logger.error('Failed to fetch studio booking conflicts:', error);
    return [];
  }

  // Fetch admin profiles for all unique resolved_by_id values
  const resolverIds = [...new Set(conflicts.map((c) => c.resolved_by_id).filter(Boolean))];
  let profiles: any[] = [];
  if (resolverIds.length > 0) {
    const { data } = await adminAuthClient
      .from('profiles')
      .select('id, email, fullName')
      .in('id', resolverIds);
    profiles = data || [];
  }

  // Map conflicts to inject solver name/email for easy UI rendering
  return conflicts.map((conflict) => {
    const resolver = profiles.find((p) => p.id === conflict.resolved_by_id);
    return {
      ...conflict,
      resolved_by_name: resolver?.fullName || null,
      resolved_by_email: resolver?.email || null,
    };
  });
}

export async function resolveStudioBookingConflict(
  conflictId: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile.role)) {
      return { success: false, error: 'Forbidden' };
    }

    // Only SUPER_ADMIN/DEVELOPER is allowed to approve overrides and bypass booking checks
    if (status === 'approved' && profile.role !== 'SUPER_ADMIN' && profile.role !== 'DEVELOPER') {
      return { success: false, error: 'Unauthorized: Only Super Admins can approve booking overrides.' };
    }

    // 1. Fetch details of the conflict log
    const { data: conflict, error: fetchError } = await adminAuthClient
      .from('studio_booking_conflicts')
      .select('*')
      .eq('id', conflictId)
      .single();

    if (fetchError || !conflict) {
      logger.error('Fetch conflict detail failed:', fetchError);
      return { success: false, error: 'Conflict record not found' };
    }

    let createdBookingId = null;

    // 2. If approved, create the studio booking bypassing the overlap trigger check
    if (status === 'approved') {
      // Write a client-friendly note so the client understands what happened
      // without seeing internal admin jargon like "Admin override".
      const clientNote = [
        `Your booking has been confirmed! Our team made scheduling adjustments to free up this slot for you.`,
        notes ? `Admin note: ${notes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const { data: newBooking, error: bookingError } = await adminAuthClient
        .from('studio_bookings')
        .insert({
          client_id: conflict.client_id,
          date_time: conflict.attempted_date_time,
          duration_hours: conflict.attempted_duration_hours,
          purpose: conflict.attempted_purpose,
          status: 'CONFIRMED', // Approved overrides are confirmed
          amount_paid: 0,
          additional_charges: 0,
          notes: clientNote,
          override: true,
        })
        .select('id')
        .single();

      if (bookingError || !newBooking) {
        logger.error('Create booking from override failed:', bookingError);
        return { success: false, error: `Failed to create booking: ${bookingError?.message}` };
      }

      createdBookingId = newBooking.id;

      // Link equipment items
      const equipmentIds = conflict.attempted_equipment_ids || [];
      if (Array.isArray(equipmentIds) && equipmentIds.length > 0) {
        const joinRows = equipmentIds.map((eqId: string) => ({
          A: newBooking.id,
          B: eqId,
        }));
        const { error: joinError } = await adminAuthClient
          .from('_StudioBookingToEquipment')
          .insert(joinRows);

        if (joinError) {
          logger.error('Linking equipment to override booking failed:', joinError);
          // Rollback the created booking if linking fails
          await adminAuthClient.from('studio_bookings').delete().eq('id', newBooking.id);
          return { success: false, error: `Failed to link equipment: ${joinError.message}` };
        }
      }
    }

    // 3. Update conflict status log
    const { error } = await adminAuthClient
      .from('studio_booking_conflicts')
      .update({
        status,
        resolved_by_id: user.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes || null,
        created_booking_id: createdBookingId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conflictId);

    if (error) {
      logger.error('Failed to resolve conflict log:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/booking-conflicts');
    revalidatePath('/dashboard');
    revalidatePath('/client/dashboard');
    return { success: true };
  } catch (error: any) {
    logger.error('resolveStudioBookingConflict error:', error);
    return { success: false, error: error.message || 'Server error' };
  }
}

