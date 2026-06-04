'use client';

import { useNotifications } from '@/components/ui/useNotifications';

export function SignOutButton() {
  const { showModal, removeModal, showLoader } = useNotifications();

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const modalId = showModal({
      title: 'Sign Out',
      description: 'Are you sure you want to sign out of WanderingKite?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      onCancel: () => removeModal(modalId),
      onConfirm: () => {
        showLoader('Signing out...');
        // We submit the form programmatically so the server route handles it
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/auth/signout';
        document.body.appendChild(form);
        form.submit();
      },
    });
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-primary/50 hover:text-primary transition-colors"
      title="Sign Out"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-log-out"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </svg>
    </button>
  );
}
