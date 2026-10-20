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
  // No fallback on purpose. This used to default to a hardcoded literal, which
  // meant a missing NEXTAUTH_SECRET in a deploy would silently sign real
  // customer-portal sessions with a value committed to a public repo — anyone
  // could have forged one. With the fallback gone, NextAuth raises MissingSecret
  // instead, so the misconfiguration fails loudly rather than quietly.
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
