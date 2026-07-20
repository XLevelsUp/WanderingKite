/**
 * Developer Account Creation Script — WanderingKite Studio
 *
 * Creates a Supabase Auth user with profiles.role = 'DEVELOPER' — a real,
 * distinct role in the UserRole enum (not a disguised SUPER_ADMIN). Every
 * RLS policy and inline role check that should allow developers lists
 * 'DEVELOPER' explicitly (see migration 00047_developer_role.sql).
 *
 * Requires env vars (does NOT hardcode credentials) — reads them from
 * .env.local automatically via Node's --env-file flag:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run (cmd.exe):
 *   set DEV_EMAIL=you@example.com&& set DEV_PASSWORD=choose-a-strong-password&& node --env-file=.env.local scripts/create-developer.js
 *
 * Run (bash):
 *   DEV_EMAIL=you@example.com DEV_PASSWORD='choose-a-strong-password' node --env-file=.env.local scripts/create-developer.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEV_EMAIL = process.env.DEV_EMAIL;
const DEV_PASSWORD = process.env.DEV_PASSWORD;
const DEV_FULL_NAME = process.env.DEV_FULL_NAME || 'Developer';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.'
  );
  process.exit(1);
}

if (!DEV_EMAIL || !DEV_PASSWORD) {
  console.error(
    'Usage: DEV_EMAIL=you@example.com DEV_PASSWORD=\'strong-password\' node scripts/create-developer.js'
  );
  process.exit(1);
}

if (DEV_PASSWORD.length < 8) {
  console.error('DEV_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Create the auth user. This fires the on_auth_user_created trigger,
  //    which inserts a matching public.profiles row (default role EMPLOYEE).
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      email_confirm: true,
    });

  if (createError || !created?.user) {
    console.error('Failed to create auth user:', createError?.message);
    process.exit(1);
  }

  const userId = created.user.id;

  // 2. Promote the auto-created profile to the DEVELOPER role.
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: 'DEVELOPER',
      fullName: DEV_FULL_NAME,
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Failed to set DEVELOPER role:', updateError.message);
    console.error(
      `Auth user ${userId} was created but its profile was NOT updated — fix manually.`
    );
    process.exit(1);
  }

  console.log('Developer account created:');
  console.log(`  email: ${DEV_EMAIL}`);
  console.log(`  user id: ${userId}`);
  console.log('  role: DEVELOPER');
}

main();
