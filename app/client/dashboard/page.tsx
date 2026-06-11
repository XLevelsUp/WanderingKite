import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import ClientSignOutButton from "@/components/client-auth/ClientSignOutButton";
import ClientDashboardWrapper from "@/components/client-dashboard/ClientDashboardWrapper";

export const metadata = {
  title: "Client Dashboard — WanderingKite Studio",
  description: "View your bookings, active rentals, and preferred creative services.",
};

export default async function ClientDashboardPage() {
  const session = await auth();

  // Route protection is handled in middleware, but double check
  if (!session || !session.user || (session.user as any).role !== "client") {
    redirect("/client/login");
  }

  // Fetch client details including selected services and ID proofs via Supabase Server Client
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from("clients")
    .select("*, client_services(type), client_id_proofs(*)")
    .eq("email", session.user.email)
    .single();

  if (error || !client) {
    console.error("Error fetching client for dashboard:", error);
    redirect("/client/login");
  }

  const clientName = client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || "Client";

  const clientProfile = {
    id: client.id,
    name: client.name,
    firstName: client.first_name,
    lastName: client.last_name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    dateOfBirth: client.date_of_birth,
    gender: client.gender,
    isActive: client.is_active,
  };

  const initialServices = client.client_services?.map((s: any) => s.type) || [];
  
  const idProofObj = Array.isArray(client.client_id_proofs) 
    ? client.client_id_proofs[0] 
    : client.client_id_proofs;

  const initialIdProof = idProofObj
    ? {
        id: idProofObj.id,
        idType: idProofObj.id_type,
        fileUrl: idProofObj.file_url,
        status: idProofObj.status,
        rejectReason: idProofObj.reject_reason,
      }
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-28 relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.02),transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Top greeting area */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
              <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0.5 px-2.5">
                Active Client
              </Badge>
            </div>
            <p className="text-slate-400 mt-1">
              Welcome back, <span className="text-amber-500 font-semibold">{clientName}</span>!
            </p>
          </div>
          <ClientSignOutButton />
        </div>

        {/* Dashboard wrapper containing vertical tabs navigation, lists, and forms */}
        <ClientDashboardWrapper
          client={clientProfile}
          initialServices={initialServices}
          initialIdProof={initialIdProof}
        />
      </div>
    </main>
  );
}
