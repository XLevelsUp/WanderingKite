'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';
import { useNotify } from '@/hooks/useNotify';

export function DeleteEquipmentButton({
  equipmentId,
  equipmentName,
}: {
  equipmentId: string;
  equipmentName: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { showError, showSuccess } = useNotify();

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowModal(false);
    try {
      const res = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete equipment');
      }

      showSuccess('Equipment deleted successfully');
      router.refresh(); // Refresh the page to show updated list
    } catch (error) {
      logger.error('[DeleteEquipment]', error);
      showError('Failed to delete equipment. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
        className="ml-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {showModal && (
          <Modal
            id={`delete-equipment-${equipmentId}`}
            title="Delete Equipment"
            description={`Are you sure you want to delete ${equipmentName}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDelete}
            onCancel={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
