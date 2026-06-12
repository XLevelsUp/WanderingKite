'use client';

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNotifications } from "@/components/ui/useNotifications";
import { signOut } from "next-auth/react";

export default function ClientSignOutButton() {
  const { showModal, removeModal, showLoader } = useNotifications();

  const handleSignOut = () => {
    const modalId = showModal({
      title: "Sign Out",
      description: "Are you sure you want to sign out of your client account?",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      onCancel: () => removeModal(modalId),
      onConfirm: () => {
        showLoader("Signing out...");
        signOut({ callbackUrl: "/client/login" });
      },
    });
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
