import ClientLoginForm from "@/components/client-auth/ClientLoginForm";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Client Login",
  description: "Sign in to your WanderingKite client account to manage bookings and rentals.",
};

export default async function ClientLoginPage() {
  const session = await auth();
  if (session && session.user) {
    redirect("/client/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-24">
      {/* Background radial glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.03),transparent_60%)] pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        <ClientLoginForm />
      </div>
    </main>
  );
}
