import { getEmployeePayrollHistory } from '@/actions/hr/payroll';
import { getHREmployee } from '@/actions/hr/employees';
import Link from 'next/link';
import { ChevronLeft, DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Employee Payroll History — Admin' };

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default async function EmployeePayrollPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const employeeId = resolvedParams.id;
  
  const [employee, payrolls] = await Promise.all([
    getHREmployee(employeeId),
    getEmployeePayrollHistory(employeeId)
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <div className='p-6 md:p-8 space-y-8 max-w-5xl mx-auto'>
      {/* Back Navigation */}
      <Link
        href='/admin/employees'
        className='inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/10 transition-colors'
      >
        <ChevronLeft className='w-4 h-4' />
        Back to Employees
      </Link>

      {/* Header */}
      <div>
        <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75 mb-1 flex items-center gap-2'>
          <DollarSign className='w-3 h-3' />
          Payroll History
        </p>
        <h1 className='text-3xl font-bold text-foreground tracking-tight'>
          {employee.fullName}
        </h1>
        <p className='text-sm text-foreground/45 mt-1'>
          {employee.contract?.jobTitle || 'No Title'} • {employee.email}
        </p>
      </div>

      {/* Payroll List */}
      {payrolls.length === 0 ? (
        <div className='rounded-xl border border-white/10 bg-[rgba(17,17,22,0.5)] p-12 text-center'>
          <FileText className='w-12 h-12 text-foreground/20 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-foreground mb-1'>No Payroll Records</h3>
          <p className='text-sm text-foreground/50'>
            This employee does not have any generated payroll records yet.
          </p>
        </div>
      ) : (
        <div className='rounded-xl border border-primary/15 bg-[rgba(17,17,22,0.85)] backdrop-blur-md overflow-hidden'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='border-b border-primary/12'>
                <th className='py-4 px-5 text-primary font-semibold text-xs uppercase tracking-widest opacity-80'>Month</th>
                <th className='py-4 px-5 text-primary font-semibold text-xs uppercase tracking-widest opacity-80'>Net Pay</th>
                <th className='py-4 px-5 text-primary font-semibold text-xs uppercase tracking-widest opacity-80'>Status</th>
                <th className='py-4 px-5 text-primary font-semibold text-xs uppercase tracking-widest opacity-80 text-right'>Action</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((record) => (
                <tr key={record.id} className='border-b border-primary/8 hover:bg-primary/5 transition-colors'>
                  <td className='py-4 px-5'>
                    <p className='font-medium text-foreground text-sm'>
                      {MONTH_NAMES[record.month]} {record.year}
                    </p>
                    <p className='text-xs text-foreground/40 mt-0.5'>
                      {record.workingDays} working days
                    </p>
                  </td>
                  <td className='py-4 px-5'>
                    <p className='font-mono font-semibold text-foreground'>
                      ₹{record.netPayout.toLocaleString('en-IN')}
                    </p>
                  </td>
                  <td className='py-4 px-5'>
                    {record.status === 'PAID' ? (
                      <span className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/12 text-emerald-400 border border-emerald-500/25'>
                        <CheckCircle className='w-3 h-3' /> Paid
                      </span>
                    ) : record.status === 'APPROVED' ? (
                      <span className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/12 text-blue-400 border border-blue-500/25'>
                        <CheckCircle className='w-3 h-3' /> Approved
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/8 text-foreground/60 border border-white/12'>
                        <Clock className='w-3 h-3' /> Draft
                      </span>
                    )}
                  </td>
                  <td className='py-4 px-5 text-right'>
                    <Link
                      href={`/admin/payroll/${record.year}-${String(record.month).padStart(2, '0')}?employee=${record.employeeId}`}
                      className='inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors'
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
