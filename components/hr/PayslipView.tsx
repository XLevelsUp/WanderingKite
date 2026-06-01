'use client';

import { Printer, ArrowLeft, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import type { PayrollRecordWithEmployee } from '@/lib/types/hr';
import Link from 'next/link';

interface PayslipViewProps {
  record: PayrollRecordWithEmployee;
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className={bold ? 'bg-gray-50 font-bold' : ''}>
      <td className='py-2.5 px-4 text-xs text-gray-700 border-b border-gray-100'>{label}</td>
      <td className='py-2.5 px-4 text-xs text-gray-900 text-right border-b border-gray-100 font-semibold tabular-nums'>
        {value}
      </td>
    </tr>
  );
}

export function PayslipView({ record }: PayslipViewProps) {
  const { employee } = record;
  const payPeriod = `${MONTH_NAMES[record.month]} ${record.year}`;
  const grossEarnings = record.basePay + record.overtimeAmount + record.bonusAmount + (record.incentive ?? 0);
  const totalDeductions =
    record.latePenalty + record.taxDeduction + record.otherDeductions;

  return (
    <div className='p-4 md:p-8 space-y-6 max-w-3xl mx-auto'>
      {/* Screen-only controls */}
      <div className='print:hidden flex items-center justify-between'>
        <Link
          href={`/admin/payroll`}
          className='flex items-center gap-2 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Payroll Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className='flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/35 bg-primary/8 text-xs font-bold text-primary hover:bg-primary/18 hover:border-primary/60 transition-all'
        >
          <Printer className='h-4 w-4' />
          Print Payslip
        </button>
      </div>

      {/* Payslip card */}
      <div
        id='payslip'
        className='bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none border border-gray-100'
      >
        {/* Studio header */}
        <div className='bg-gray-950 px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 text-white'>
          <div>
            <p className='text-[10px] font-bold uppercase tracking-[0.25em] text-primary opacity-80 mb-1.5 flex items-center gap-1.5'>
              <Shield className='w-3 h-3' />
              STUDIO PAY SLIP
            </p>
            <h1 className='text-2xl font-bold tracking-tight'>Wandering Kite Studio</h1>
            <p className='text-xs text-gray-400 mt-1'>Corporate HR & Payroll Ledger</p>
          </div>
          <div className='sm:text-right'>
            <p className='text-base font-bold text-white'>{payPeriod}</p>
            <p className='text-xs text-gray-500 mt-1'>
              Ledger Status:{' '}
              <span
                className={`font-semibold ${
                  record.status === 'PAID'
                    ? 'text-emerald-400'
                    : record.status === 'APPROVED'
                      ? 'text-blue-400'
                      : record.status === 'REJECTED'
                        ? 'text-red-500'
                        : 'text-yellow-400'
                }`}
              >
                {record.status}
              </span>
            </p>
            {record.paymentRef && (
              <p className='text-[11px] text-gray-400 mt-1.5 bg-white/5 px-2 py-0.5 rounded inline-block'>Ref: {record.paymentRef}</p>
            )}
          </div>
        </div>

        {/* Employee info */}
        <div className='px-8 py-6 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50'>
          <div>
            <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2'>
              Employee Profile
            </p>
            <p className='font-bold text-gray-900 text-base'>{employee.fullName ?? '—'}</p>
            <p className='text-xs text-gray-500 mt-0.5'>{employee.email}</p>
            {employee.contract?.jobTitle && (
              <p className='text-xs text-gray-400 mt-1 font-medium bg-gray-200/50 inline-block px-2 py-0.5 rounded'>{employee.contract.jobTitle}</p>
            )}
          </div>
          <div>
            <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2'>
              Payment Mode
            </p>
            {employee.contract?.bankAccountNumber ? (
              <div className='text-xs text-gray-700 space-y-0.5'>
                <p><span className='text-gray-400'>A/C Name:</span> {employee.contract.bankAccountName || '—'}</p>
                <p><span className='text-gray-400'>A/C No:</span> {employee.contract.bankAccountNumber}</p>
                <p><span className='text-gray-400'>IFSC:</span> {employee.contract.bankIFSC || '—'}</p>
              </div>
            ) : employee.contract?.upiId ? (
              <p className='text-xs text-gray-700'><span className='text-gray-400'>UPI ID:</span> {employee.contract.upiId}</p>
            ) : (
              <p className='text-xs text-gray-400 italic'>No bank details configured</p>
            )}
          </div>
        </div>

        {/* Attendance Breakdown & Base Calculations (10 Items) */}
        <div className='px-8 py-6 border-b border-gray-100'>
          <p className='text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5'>
            <Calendar className='w-3.5 h-3.5 text-gray-400' />
            Attendance & Base Salary Calculations
          </p>
          <table className='w-full'>
            <tbody>
              <Row label='Calendar Month Working Days' value={`${record.workingDays} days`} />
              <Row label='Present Days' value={`${record.presentDays} days`} />
              <Row label='Absent Days (Deducted)' value={`${record.absentDays ?? 0} days`} />
              <Row label='Leave Days (Total Taken)' value={`${record.leaveDays ?? 0} days`} />
              <Row label='Paid Leaves Used (Quota Covered)' value={`${record.paidLeavesUsed ?? 0} days`} />
              <Row label='Half Days (0.5 Payout Rate)' value={`${record.halfDays ?? 0} days`} />
              <Row label='Late Arrival Days' value={`${record.lateDays ?? 0} days`} />
              <Row label='On-Aid Leave Days (Fully Paid)' value={`${record.onAidLeaveDays ?? 0} days`} />
              <Row label='Total Deduction Days' value={`${record.deductionDays ?? 0} days`} />
              <Row label='Calculated Per-Day Salary' value={fmt(record.perDaySalary ?? (record.baseSalary / (record.workingDays || 30)))} />
            </tbody>
          </table>
        </div>

        {/* Earnings table (6 Items) */}
        <div className='px-8 py-6 border-b border-gray-100'>
          <p className='text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5'>
            <TrendingUp className='w-3.5 h-3.5 text-emerald-500' />
            Earnings
          </p>
          <table className='w-full'>
            <tbody>
              <Row label='Base Salary (Uniform Contract Base)' value={fmt(record.baseSalary)} />
              <Row label='Attendance Deductions (Leaves / Absences)' value={`− ${fmt(record.deductionsTotal ?? 0)}`} />
              <Row label='Base Pay (Net Base Salary Earned)' value={fmt(record.basePay)} bold />
              {(record.incentive ?? 0) > 0 && (
                <Row label={`Monthly Incentives (${record.incentiveHours ?? 0} hrs)`} value={fmt(record.incentive)} />
              )}
              {record.overtimeAmount > 0 && (
                <Row label={`Overtime Pay (${record.overtimeHours ?? 0} hrs)`} value={fmt(record.overtimeAmount)} />
              )}
              {record.bonusAmount > 0 && (
                <Row label='Performance Bonus' value={fmt(record.bonusAmount)} />
              )}
              <Row label='Gross Earnings' value={fmt(grossEarnings)} bold />
            </tbody>
          </table>
        </div>

        {/* Deductions table */}
        <div className='px-8 py-6 border-b border-gray-100'>
          <p className='text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5'>
            <TrendingDown className='w-3.5 h-3.5 text-red-500' />
            Statutory & Policy Deductions
          </p>
          <table className='w-full'>
            <tbody>
              {record.latePenalty > 0 && (
                <Row label='Late Arrival Deductions' value={`− ${fmt(record.latePenalty)}`} />
              )}
              {record.taxDeduction > 0 && (
                <Row label='TDS (Tax Deducted at Source)' value={`− ${fmt(record.taxDeduction)}`} />
              )}
              {record.otherDeductions > 0 && (
                <Row label='Other Deductions / Overrides' value={`− ${fmt(record.otherDeductions)}`} />
              )}
              {totalDeductions === 0 && (
                <Row label='No Statutory Deductions' value='₹0.00' />
              )}
              <Row label='Total Statutory Deductions' value={`− ${fmt(totalDeductions)}`} bold />
            </tbody>
          </table>
        </div>

        {/* Net payout */}
        <div className='px-8 py-6 bg-gray-950 flex items-center justify-between text-white'>
          <div>
            <p className='text-xs font-bold uppercase tracking-wider text-gray-400'>
              Net Salary Payout
            </p>
            <p className='text-[10px] text-gray-500 mt-1'>{payPeriod}</p>
          </div>
          <p className='text-3xl font-extrabold text-white tracking-tight'>{fmt(record.netPayout)}</p>
        </div>

        {/* Footer */}
        <div className='px-8 py-5 bg-gray-50 border-t border-gray-100 text-center text-gray-400'>
          <p className='text-[10px]'>
            This is a computer-generated payslip. No physical signature is required.
          </p>
          <p className='text-[9px] mt-1 text-gray-300'>
            Transaction/Record Token: {record.id}
          </p>
        </div>
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z' />
    </svg>
  );
}
