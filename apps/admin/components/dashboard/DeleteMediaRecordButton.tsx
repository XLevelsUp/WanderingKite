'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { deleteMediaRecord } from '@/actions/media-tracker';

export function DeleteMediaRecordButton({
  recordId,
  recordTitle,
  onDeleted,
}: {
  recordId: string;
  recordTitle: string;
  onDeleted?: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowModal(false);
    try {
      await deleteMediaRecord(recordId);
      toast.success('Media record deleted');
      if (onDeleted) onDeleted();
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete media record');
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
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {showModal && (
          <Modal
            id={`delete-media-record-${recordId}`}
            title="Delete Media Record"
            description={`Are you sure you want to delete "${recordTitle}"? This action cannot be undone.`}
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
