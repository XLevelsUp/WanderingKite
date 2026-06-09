'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { showError, showSuccess } = useNotify();

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${equipmentName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
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
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="ml-2"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
