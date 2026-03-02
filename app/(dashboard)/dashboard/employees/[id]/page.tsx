import { getBranches, getEmployee, getAdmins } from '@/actions/employees';
import { EmployeeForm } from '@/components/employees/employee-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface EmployeePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmployeePage(props: EmployeePageProps) {
  const params = await props.params;
  const { id } = params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  const employee = await getEmployee(id);

  if (!employee) {
    redirect('/dashboard/employees');
  }

  // EMPLOYEE role can only view/edit their own record
  if (profile?.role === 'EMPLOYEE' && profile.id !== id) {
    redirect('/dashboard/employees');
  }

  const [branches, admins] = await Promise.all([getBranches(), getAdmins()]);

  return (
    <div className='flex-1 space-y-4 p-8 pt-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Edit Employee</h2>
      </div>
      <div className='grid gap-4 grid-cols-1 md:max-w-2xl'>
        <EmployeeForm
          initialData={employee}
          branches={branches || []}
          managers={admins || []}
          isEditing={true}
        />
      </div>
    </div>
  );
}
