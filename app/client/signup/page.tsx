import ClientSignupForm from "@/components/client-auth/ClientSignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Signup",
  description: "Register for a WanderingKite client account to book studios and rent gear.",
};

export default function ClientSignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-24">
      {/* Background radial glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.03),transparent_60%)] pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        <ClientSignupForm />
      </div>
    </main>
  );
}
