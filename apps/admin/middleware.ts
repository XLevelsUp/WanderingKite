import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// apps/admin is the staff ERP app exclusively — there is no NextAuth/client
// customer-portal session here (that's apps/marketing's concern) and no
// noindex header logic (next.config.ts's headers() already applies
// X-Robots-Tag: noindex, nofollow to every route in this app). This
// middleware's only job is refreshing the Supabase staff session and
// redirecting unauthenticated requests to /login — see
// lib/supabase/middleware.ts's updateSession for the actual gate.
export default async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
