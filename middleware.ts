import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createServerClient } from '@supabase/ssr';

// Internal paths that should never be indexed by any crawler.
const NOINDEX_PREFIXES = ['/admin', '/dashboard', '/api', '/auth', '/client'];

export async function middleware(request: NextRequest) {
  let response = await updateSession(request);

  const { pathname } = request.nextUrl;
  if (NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // Protect client paths
  const isClientPath = pathname.startsWith('/client');
  const isAuthPage = pathname === '/client/login' || pathname === '/client/signup';

  if (isClientPath && !isAuthPage) {
    // Check NextAuth client token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "default_nextauth_secret_wandering_kite_38294723",
    });

    const hasClientSession = token && token.role === 'client';

    if (!hasClientSession) {
      // Check if user is staff/admin (has Supabase session)
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
        // Staff/admin trying to access client area -> redirect to staff dashboard
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

  // Redirect authenticated client away from login/signup pages
  if (isClientPath && isAuthPage) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "default_nextauth_secret_wandering_kite_38294723",
    });

    if (token && token.role === 'client') {
      const url = request.nextUrl.clone();
      url.pathname = '/client/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

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

