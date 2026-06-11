'use client';

import { useNotifications } from '@/components/ui/useNotifications';
import { toast } from 'sonner';

interface AddServiceModalProps {
  onSuccess: (service: 'PHOTOGRAPHY' | 'RENTALS' | 'STUDIO_SPACE') => void;
}

export function useAddServiceModal({ onSuccess }: AddServiceModalProps) {
  const { showModal, showLoader, hideLoader, removeModal } = useNotifications();

  const openAddServiceModal = (serviceType: 'PHOTOGRAPHY' | 'RENTALS' | 'STUDIO_SPACE') => {
    const serviceName =
      serviceType === 'PHOTOGRAPHY'
        ? 'Photography'
        : serviceType === 'RENTALS'
        ? 'Rentals'
        : 'Studio Space';

    const modalId = showModal({
      title: `Add ${serviceName} Service`,
      description: `Are you sure you want to add ${serviceName} to your account? This will unlock the ${serviceName} booking portal on your dashboard.`,
      confirmText: 'Add Service',
      cancelText: 'Cancel',
      onCancel: () => removeModal(modalId),
      onConfirm: async () => {
        showLoader(`Adding ${serviceName}...`);
        try {
          const res = await fetch('/api/client/services/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service: serviceType }),
          });

          if (!res.ok) {
            throw new Error('Failed to add service');
          }

          toast.success(`${serviceName} has been added to your account`);
          onSuccess(serviceType);
        } catch (error) {
          console.error(error);
          toast.error('Could not add service. Please try again.');
        } finally {
          hideLoader();
          removeModal(modalId);
        }
      },
    });
  };

  return { openAddServiceModal };
}
