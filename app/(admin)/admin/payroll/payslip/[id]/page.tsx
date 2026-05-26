import { getPayslip } from '@/actions/hr/payroll';
import { PayslipView } from '@/components/hr/PayslipView';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Payslip — Admin' };

export default async function PayslipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getPayslip(id);

  if (!record) notFound();

  return (
    <div className='p-6 md:p-8 max-w-3xl mx-auto'>
      <PayslipView record={record} />
    </div>
  );
}
