'use client';

import { Printer, ArrowLeft } from 'lucide-react';
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
      <td className='py-2 px-4 text-sm text-gray-700 border-b border-gray-100'>{label}</td>
      <td className='py-2 px-4 text-sm text-gray-900 text-right border-b border-gray-100'>
        {value}
      </td>
    </tr>
  );
}

export function PayslipView({ record }: PayslipViewProps) {
  const { employee } = record;
  const payPeriod = `${MONTH_NAMES[record.month]} ${record.year}`;
  const grossEarnings = record.basePay + record.overtimeAmount + record.bonusAmount;
  const totalDeductions =
    record.latePenalty + record.unpaidLeaves + record.taxDeduction + record.otherDeductions;

  return (
    <div>
      {/* Screen-only controls */}
      <div className='print:hidden flex items-center justify-between mb-8'>
        <Link
          href={`/admin/payroll`}
          className='flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Payroll
        </Link>
        <button
          onClick={() => window.print()}
          className='flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/35 bg-primary/8 text-sm font-semibold text-primary hover:bg-primary/18 hover:border-primary/60 transition-all'
        >
          <Printer className='h-4 w-4' />
          Print / Save PDF
        </button>
      </div>

      {/* Payslip card */}
      <div
        id='payslip'
        className='bg-white text-gray-900 max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg print:shadow-none print:rounded-none print:max-w-none'
      >
        {/* Studio header */}
        <div className='bg-gray-900 px-8 py-6 flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 mb-1'>
              Pay Slip
            </p>
            <h1 className='text-xl font-bold text-white'>Wandering Kite Studio</h1>
            <p className='text-xs text-gray-400 mt-0.5'>wanderingkitestudio.com</p>
          </div>
          <div className='text-right'>
            <p className='text-sm font-semibold text-gray-200'>{payPeriod}</p>
            <p className='text-xs text-gray-500 mt-1'>
              Status:{' '}
              <span
                className={
                  record.status === 'PAID'
                    ? 'text-emerald-400'
                    : record.status === 'APPROVED'
                      ? 'text-blue-400'
                      : 'text-yellow-400'
                }
              >
                {record.status}
              </span>
            </p>
            {record.paymentRef && (
              <p className='text-[11px] text-gray-500 mt-0.5'>Ref: {record.paymentRef}</p>
            )}
          </div>
        </div>

        {/* Employee info */}
        <div className='px-8 py-5 border-b border-gray-100 grid grid-cols-2 gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2'>
              Employee
            </p>
            <p className='font-semibold text-gray-900'>{employee.fullName ?? '—'}</p>
            <p className='text-sm text-gray-500'>{employee.email}</p>
            {employee.contract?.jobTitle && (
              <p className='text-sm text-gray-500 mt-0.5'>{employee.contract.jobTitle}</p>
            )}
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2'>
              Attendance
            </p>
            <p className='text-sm text-gray-700'>
              <span className='font-semibold'>{record.presentDays}</span> present days out of{' '}
              <span className='font-semibold'>{record.workingDays}</span> working days
            </p>
            {record.lateDays > 0 && (
              <p className='text-sm text-amber-600 mt-0.5'>
                {record.lateDays} late arrival{record.lateDays !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Earnings table */}
        <div className='px-8 py-5'>
          <p className='text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3'>
            Earnings
          </p>
          <table className='w-full'>
            <tbody>
              <Row label='Base Pay' value={fmt(record.basePay)} />
              {record.overtimeAmount > 0 && (
                <Row label='Overtime Pay' value={fmt(record.overtimeAmount)} />
              )}
              {record.bonusAmount > 0 && (
                <Row label='Bonus' value={fmt(record.bonusAmount)} />
              )}
              <Row label='Gross Earnings' value={fmt(grossEarnings)} bold />
            </tbody>
          </table>
        </div>

        {/* Deductions table */}
        <div className='px-8 pb-5'>
          <p className='text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3'>
            Deductions
          </p>
          <table className='w-full'>
            <tbody>
              {record.latePenalty > 0 && (
                <Row label='Late Penalty' value={`− ${fmt(record.latePenalty)}`} />
              )}
              {record.unpaidLeaves > 0 && (
                <Row label='Unpaid Leaves' value={`− ${fmt(record.unpaidLeaves)}`} />
              )}
              {record.taxDeduction > 0 && (
                <Row label='TDS (Tax Deducted at Source)' value={`− ${fmt(record.taxDeduction)}`} />
              )}
              {record.otherDeductions > 0 && (
                <Row label='Other Deductions' value={`− ${fmt(record.otherDeductions)}`} />
              )}
              {totalDeductions === 0 && (
                <Row label='No Deductions' value='₹0.00' />
              )}
              <Row label='Total Deductions' value={`− ${fmt(totalDeductions)}`} bold />
            </tbody>
          </table>
        </div>

        {/* Net payout */}
        <div className='px-8 py-5 bg-gray-900 flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-gray-400'>
              Net Payout
            </p>
            <p className='text-xs text-gray-500 mt-0.5'>{payPeriod}</p>
          </div>
          <p className='text-2xl font-bold text-white'>{fmt(record.netPayout)}</p>
        </div>

        {/* Footer */}
        <div className='px-8 py-4 bg-gray-50 border-t border-gray-100 text-center'>
          <p className='text-xs text-gray-400'>
            This is a computer-generated payslip. No signature required.
          </p>
          <p className='text-[11px] text-gray-300 mt-0.5'>
            Record ID: {record.id}
          </p>
        </div>
      </div>
    </div>
  );
}
