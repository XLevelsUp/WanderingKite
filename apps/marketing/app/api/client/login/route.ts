import { signIn } from "@/auth";
import { adminAuthClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
    }

    // Fetch client record to verify active status
    const { data: client, error: clientError } = await adminAuthClient
      .from('clients')
      .select('is_active')
      .eq('email', email)
      .maybeSingle();

    if (client && client.is_active === false) {
      return NextResponse.json({
        error: 'deactivated',
        message: 'Your account has been deactivated. Please contact administration for assistance.',
      }, { status: 403 });
    }

    try {
      // In NextAuth v5, signIn on the server returns a redirect URL or throws an error
      await signIn("client-credentials", {
        email,
        password,
        redirect: false,
      });

      return NextResponse.json({ success: true });
    } catch (authError: any) {
      // If it's a Next.js redirect/navigation (which means success), treat as success
      if (
        authError.message === "NEXT_REDIRECT" || 
        authError.digest?.startsWith("NEXT_REDIRECT") ||
        authError.type === "NavigationRedirect"
      ) {
        return NextResponse.json({ success: true });
      }

      logger.error("Auth helper threw error:", authError);
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
  } catch (error) {
    logger.error("Client login route unexpected error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
