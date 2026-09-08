import { getPayslip } from '@/actions/hr/payroll';
import { PayslipView } from '@/components/hr/PayslipView';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Payslip — Admin' };

export default async function PayslipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getPayslip(id);

  if (!record) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  const isEmployee = profile?.role === 'EMPLOYEE';

  return (
    <div className='p-6 md:p-8 max-w-3xl mx-auto'>
      <PayslipView record={record} isEmployee={isEmployee} />
    </div>
  );
}
