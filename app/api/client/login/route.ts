import { signIn } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
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

      console.error("Auth helper threw error:", authError);
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
  } catch (error) {
    console.error("Client login route unexpected error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
