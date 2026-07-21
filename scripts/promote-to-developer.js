/**
 * Developer Account Promotion Script — WanderingKite Studio
 *
 * Promotes an EXISTING profile (identified by email) to role = 'DEVELOPER'.
 * Use this instead of create-developer.js when the account already exists
 * (create-developer.js only creates brand-new Supabase Auth users and will
 * fail with "already been registered" if the email is taken).
 *
 * Requires env vars (does NOT hardcode credentials):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run:
 *   set DEV_EMAIL=you@example.com&& node --env-file=.env.local scripts\promote-to-developer.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEV_EMAIL = process.env.DEV_EMAIL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.'
  );
  process.exit(1);
}

if (!DEV_EMAIL) {
  console.error(
    'Usage: set DEV_EMAIL=you@example.com&& node --env-file=.env.local scripts\\promote-to-developer.js'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email, role, "fullName"')
    .eq('email', DEV_EMAIL)
    .maybeSingle();

  if (fetchError) {
    console.error('Failed to look up profile:', fetchError.message);
    process.exit(1);
  }

  if (!existing) {
    console.error(`No profile found for ${DEV_EMAIL}. Use create-developer.js instead.`);
    process.exit(1);
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'DEVELOPER' })
    .eq('id', existing.id);

  if (updateError) {
    console.error('Failed to promote profile:', updateError.message);
    process.exit(1);
  }

  console.log('Profile promoted to developer:');
  console.log(`  email: ${existing.email}`);
  console.log(`  user id: ${existing.id}`);
  console.log(`  role: ${existing.role} -> DEVELOPER`);
}

main();
