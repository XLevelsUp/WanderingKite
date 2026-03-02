import { getCategories, getBranches } from '@/actions/equipment';
import { NewEquipmentForm } from './NewEquipmentForm';

export default async function NewEquipmentPage() {
  const [categories, branches] = await Promise.all([
    getCategories(),
    getBranches(),
  ]);

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Add Equipment</h1>
        <p className='text-slate-500 mt-2'>
          Add a new item to your rental inventory
        </p>
      </div>

      <NewEquipmentForm categories={categories} branches={branches} />
    </div>
  );
}
