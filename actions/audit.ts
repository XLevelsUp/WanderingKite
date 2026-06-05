'use server';

import { adminAuthClient } from '@/lib/supabase/admin';

export async function getAuditClashLogs() {
  // Use admin client to bypass RLS (only admins can access this page anyway)
  const { data: logs, error } = await adminAuthClient
    .from('audit_clash_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !logs || logs.length === 0) {
    if (error) console.error('Failed to fetch audit clash logs:', error);
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
