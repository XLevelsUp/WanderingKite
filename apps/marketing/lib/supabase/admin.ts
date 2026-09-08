// WARNING: This is a service-role Supabase client that BYPASSES Row Level Security.
// In apps/marketing it must ONLY be imported from app/api/client/* route handlers
// (and app/client/dashboard/page.tsx, which runs server-side) — never from a page
// rendered to the browser, a client component, or any other marketing route.
// It exists here solely to support the client-portal login/signup/dashboard flow.
import { createClient } from '@supabase/supabase-js';

// Note: This client should ONLY be used in secure server-side contexts (API routes, Server Actions)
// never expose this to the client-side.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

export const adminAuthClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
