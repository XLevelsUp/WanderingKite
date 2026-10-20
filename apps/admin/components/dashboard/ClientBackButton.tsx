'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function ClientBackButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="outline"
      size="sm"
      className="border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white rounded-lg"
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      Back
    </Button>
  );
}
