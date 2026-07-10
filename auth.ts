import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAuthClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      id: "client-credentials",
      name: "Client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailVal = credentials.email as string;
        const passwordVal = credentials.password as string;

        // Fetch client using the supabase admin client to bypass RLS
        const { data: client, error } = await adminAuthClient
          .from("clients")
          .select("*")
          .eq("email", emailVal)
          .single();

        if (error || !client || !(client as any).password_hash) {
          return null;
        }

        // Check password hash
        const isValid = await bcrypt.compare(
          passwordVal,
          (client as any).password_hash
        );

        if (!isValid) {
          return null;
        }

        // Check if user is active
        if ((client as any).is_active === false) {
          return null;
        }

        // Return client session object
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          role: "client",
        };
      },
    }),
  ],
});
