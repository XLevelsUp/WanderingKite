'use client';

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNotifications } from "@/components/ui/useNotifications";
import { signOut } from "next-auth/react";

export default function ClientSignOutButton() {
  const { showLoader } = useNotifications();

  const handleSignOut = async () => {
    showLoader("Signing out...");
    await signOut({ callbackUrl: "/client/login" });
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  );
}
