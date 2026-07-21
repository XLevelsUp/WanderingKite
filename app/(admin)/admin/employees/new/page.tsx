import { getBranches, getAdmins } from '@/actions/employees';
import { getNextEmployeeNumber } from '@/actions/hr/employees';
import { UnifiedOnboardingForm } from '@/components/hr/UnifiedOnboardingForm';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Add Employee — Admin' };

export default async function NewEmployeePage() {
  const [branches, admins, nextEmpNum] = await Promise.all([getBranches(), getAdmins(), getNextEmployeeNumber()]);

  return (
    <div className='p-6 md:p-8 max-w-3xl mx-auto'>
      {/* Back link */}
      <Link
        href='/admin/employees'
        className='inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground mb-8 transition-colors'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to Employees
      </Link>

      {/* Header */}
      <div className='mb-10'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75 mb-1 flex items-center gap-2'>
          <UserPlus className='w-3 h-3' />
          HR Management
        </p>
        <h1 className='text-3xl font-bold text-foreground tracking-tight'>
          Add Employee
        </h1>
        <p className='text-sm text-foreground/45 mt-1'>
          Create an employee account and set up their HR contract in a single flow.
        </p>
      </div>

      <UnifiedOnboardingForm
        branches={branches ?? []}
        managers={(admins ?? []).map((a: any) => ({ id: a.id, fullName: a.fullName }))}
        nextEmployeeNumber={nextEmpNum}
      />
    </div>
  );
}
