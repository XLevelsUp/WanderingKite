'use server';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Read-only accessor for the global rental policy, used by the public
 * /rentals page to price the cart (repeat-client discount + billing policy).
 *
 * The staff-facing half of this module — requireAdminOrSuper,
 * updateGlobalRentalPolicySettings, updateEquipmentRate and
 * getClientCustomContracts — deliberately does NOT live here. It is owned by
 * apps/admin/actions/rental-policy.ts. Keeping a copy in the marketing app
 * compiled those mutations into 'use server' endpoints on the public origin
 * for no reason, and their auth guard redirected to /login, a route this app
 * no longer has. Add staff mutations to the admin copy only.
 *
 * Note: rental_policy_settings has RLS allowing only ADMIN/SUPER_ADMIN reads,
 * so an anonymous visitor gets null here and the caller falls back to a 0%
 * discount. Granting anon read on that table is a separate migration.
 */
export async function getGlobalRentalPolicySettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rental_policy_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching settings', error);
    return null;
  }
  return data;
}
