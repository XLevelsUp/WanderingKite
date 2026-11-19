// Cookie-free, anon-key Supabase client for PUBLIC reads only (RLS limits it to published content).
// Unlike lib/supabase/server.ts it doesn't touch cookies(), so pages using it can be statically cached and revalidated (ISR).
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

let client: ReturnType<typeof createClient<Database>> | null = null;

export function publicClient() {
  client ??= createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return client;
}
