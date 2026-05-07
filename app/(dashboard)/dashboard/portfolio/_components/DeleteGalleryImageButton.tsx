'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteGalleryImage } from '@/actions/shoots';

export function DeleteGalleryImageButton({ id, shootId }: { id: string; shootId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this image?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteGalleryImage(id, shootId);
    } catch (error) {
      console.error(error);
      alert('Failed to delete image.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
