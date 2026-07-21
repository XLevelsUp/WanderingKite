import { getHREmployees } from '@/actions/hr/employees';
import { HREmployeeTable } from '@/components/hr/EmployeeTable';
import { createClient } from '@/lib/supabase/server';
import { UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Employees — Admin' };

export default async function AdminEmployeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null };

  const currentUserRole = (profile?.role ?? 'EMPLOYEE') as 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
  const employees = await getHREmployees();

  return (
    <div className='p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75 mb-1 flex items-center gap-2'>
            <Users className='w-3 h-3' />
            HR Management
          </p>
          <h1 className='text-3xl font-bold text-foreground tracking-tight'>
            Employee Directory
          </h1>
          <p className='text-sm text-foreground/45 mt-1'>
            Manage contracts, roles, and compensation for all team members.
          </p>
        </div>

        <Link
          href='/admin/employees/new'
          className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-all self-start sm:self-auto'
        >
          <UserPlus className='h-4 w-4' />
          Onboard Employee
        </Link>
      </div>

      <HREmployeeTable employees={employees} currentUserRole={currentUserRole} />
    </div>
  );
}
