import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RentalsPage() {
  return (
    <div className='space-y-8 p-8 pt-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Rentals</h2>
        <div className='flex items-center space-x-2'>
          <Link href='/dashboard/rentals/new'>
            <Button>Create Rental</Button>
          </Link>
        </div>
      </div>
      <div>
        <p>Rental management list will appear here.</p>
        <p className='text-sm text-slate-500'>Implementation pending.</p>
      </div>
    </div>
  );
}
