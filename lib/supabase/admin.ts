import { createClient } from '@supabase/supabase-js';

// Note: This client should ONLY be used in secure server-side contexts (API routes, Server Actions)
// never expose this to the client-side.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

export const adminAuthClient = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
