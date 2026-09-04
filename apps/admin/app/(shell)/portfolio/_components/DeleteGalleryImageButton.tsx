'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteGalleryImage } from '@/actions/shoots-admin';
import { Modal } from '@/components/ui/Modal';
import { AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';

export function DeleteGalleryImageButton({
  id,
  shootId,
}: {
  id: string;
  shootId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowModal(false);
    try {
      await deleteGalleryImage(id, shootId);
    } catch (error) {
      logger.error('[DeleteGalleryImage]', error);
      alert('Failed to delete image.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {showModal && (
          <Modal
            id={`delete-gallery-image-${id}`}
            title="Remove Image"
            description="Are you sure you want to remove this image?"
            confirmText="Remove"
            cancelText="Cancel"
            onConfirm={handleDelete}
            onCancel={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
