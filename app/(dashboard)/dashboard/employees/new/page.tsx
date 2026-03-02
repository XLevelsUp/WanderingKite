import { getBranches, getAdmins } from '@/actions/employees';
import { EmployeeForm } from '@/components/employees/employee-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewEmployeePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'SUPER_ADMIN' && profile?.role !== 'ADMIN') {
    redirect('/dashboard/employees');
  }

  const [branches, admins] = await Promise.all([getBranches(), getAdmins()]);

  return (
    <div className='flex-1 space-y-4 p-8 pt-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Add Employee</h2>
      </div>
      <div className='grid gap-4 grid-cols-1 md:max-w-2xl'>
        <EmployeeForm branches={branches || []} managers={admins || []} />
      </div>
    </div>
  );
}
