import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPhotoCatalog } from '@/actions/shoots-admin';
import { ShootForm } from '../_components/ShootForm';

export default async function NewShootPage() {
  const { categories, cities } = await getPhotoCatalog();

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/portfolio">
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to portfolio">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Album</h1>
          <p className="mt-1 text-sm text-foreground/40">Create the album, then upload its photos on the next screen</p>
        </div>
      </div>

      <ShootForm categories={categories} cities={cities} />
    </div>
  );
}
