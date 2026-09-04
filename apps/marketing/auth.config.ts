import type { NextAuthConfig } from "next-auth";

// Edge-safe config shared by the full NextAuth instance (auth.ts) and the
// middleware. It intentionally has NO providers here — the credentials
// provider lives in auth.ts because it imports bcryptjs (Node-only) and the
// Supabase admin client, which cannot run on the Edge runtime.
//
// Because both the app (auth()) and the middleware read the session through
// this same config (same secret, cookies, session strategy, and callbacks),
// they can never disagree about whether a user is logged in. That is what
// prevents the /client/login <-> /client/dashboard redirect loop.
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "client";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || "client";
      }
      return session;
    },
  },
  pages: {
    signIn: "/client/login",
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "default_nextauth_secret_wandering_kite_38294723",
} satisfies NextAuthConfig;
