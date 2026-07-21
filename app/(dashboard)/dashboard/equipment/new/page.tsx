import { getCategories, getBranches } from '@/actions/equipment';
import { NewEquipmentForm } from './NewEquipmentForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function NewEquipmentPage() {
  const [categories, branches] = await Promise.all([
    getCategories(),
    getBranches(),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/equipment">
        <Button variant="ghost" size="sm" className="gap-2 text-foreground/50 hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Equipment</h1>
        <p className="text-slate-500 mt-2">
          Add a new item to your rental inventory
        </p>
      </div>

      <NewEquipmentForm categories={categories} branches={branches} />
    </div>
  );
}
