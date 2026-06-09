'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteShoot } from '@/actions/shoots';
import { logger } from '@/lib/logger';
import { useNotifications } from '@/components/ui/useNotifications';

export function DeleteShootButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showModal, removeModal } = useNotifications();

  const handleDelete = () => {
    const modalId = showModal({
      title: 'Delete Shoot',
      description: `Are you sure you want to delete the shoot "${title}"? This will also remove all associated images.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        removeModal(modalId);
        setIsDeleting(true);
        try {
          await deleteShoot(id);
        } catch (error) {
          logger.error('[DeleteShoot]', error);
          alert('Failed to delete shoot.');
        } finally {
          setIsDeleting(false);
        }
      },
      onCancel: () => {
        removeModal(modalId);
      },
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
