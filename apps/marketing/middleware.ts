import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { createServerClient } from '@supabase/ssr';

// Read the NextAuth session using the SAME edge-safe config the app uses via
// auth(). This guarantees middleware and the app agree on login state (same
// secret, cookies, session strategy) — fixing the redirect loop that happened
// when the legacy getToken() couldn't read the secure cookie on production.
const { auth } = NextAuth(authConfig);

// Internal paths that should never be indexed by any crawler. Marketing no
// longer owns /admin, /dashboard, or /login (those moved to apps/admin), so
// only the paths that still exist in this app are listed here.
const NOINDEX_PREFIXES = ['/api', '/auth', '/client'];

export default auth(async function middleware(request) {
  const response = NextResponse.next();

  const { pathname } = request.nextUrl;
  if (NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // Protect client paths
  const isClientPath = pathname.startsWith('/client');
  const isAuthPage = pathname === '/client/login' || pathname === '/client/signup';

  if (isClientPath) {
    // request.auth is populated by the auth() wrapper above.
    const hasClientSession =
      Boolean(request.auth?.user) &&
      (request.auth!.user as any).role === 'client';

    if (isAuthPage) {
      if (hasClientSession) {
        const url = request.nextUrl.clone();
        url.pathname = '/client/dashboard';
        return NextResponse.redirect(url);
      }
    } else {
      if (!hasClientSession) {
        // Check if user is staff/admin (has a Supabase session). Marketing no
        // longer runs the Supabase staff-session-refresh middleware (that's
        // an admin/staff concern that now lives entirely in apps/admin), but
        // we still need to distinguish "staff browsing by mistake" from
        // "anonymous visitor" so staff get sent to the right place instead of
        // the client login form.
        const supabaseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseKey =
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        });

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Staff/admin trying to access the client area -> send them to the
          // admin app (this app no longer has a /dashboard to redirect to).
          // NEXT_PUBLIC_ADMIN_URL should point at the deployed apps/admin
          // origin (e.g. https://admin.wanderingkite.in); fall back to a
          // relative /dashboard only if that env var isn't set yet, so this
          // doesn't hard-fail before the admin app has a real URL.
          const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
          if (adminUrl) {
            const url = new URL('/dashboard', adminUrl);
            url.searchParams.set('message', 'That page is for clients only');
            return NextResponse.redirect(url);
          }

          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          url.searchParams.set('message', 'That page is for clients only');
          return NextResponse.redirect(url);
        }

        // Unauthenticated user -> redirect to client login
        const url = request.nextUrl.clone();
        url.pathname = '/client/login';
        url.searchParams.set('message', 'Please log in to access your dashboard');
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
