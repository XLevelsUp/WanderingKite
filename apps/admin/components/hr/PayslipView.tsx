'use client';

import { Printer, Download, ArrowLeft, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import type { PayrollRecordWithEmployee } from '@/lib/types/hr';
import Link from 'next/link';

interface PayslipViewProps {
  record: PayrollRecordWithEmployee;
  isEmployee?: boolean;
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
      <td className='py-1.5 px-4 text-[11px] text-gray-700 border-b border-gray-100'>{label}</td>
      <td className='py-1.5 px-4 text-[11px] text-gray-900 text-right border-b border-gray-100 font-semibold tabular-nums'>
        {value}
      </td>
    </tr>
  );
}

export function PayslipView({ record, isEmployee = false }: PayslipViewProps) {
  const { employee } = record;
  const payPeriod = `${MONTH_NAMES[record.month]} ${record.year}`;
  
  const grossEarnings = record.grossEarnings ?? (record.basePay + record.overtimeAmount + record.bonusAmount + (record.incentive ?? 0));
  const totalDeductions = record.latePenalty + record.otherDeductions + (record.pfAmount ?? 0) + (record.ptAmount ?? 0) + (record.tdsAmount ?? 0);

  return (
    <div className='p-4 md:p-8 space-y-6 max-w-3xl mx-auto'>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #payslip, #payslip * {
            visibility: visible;
          }
          #payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `}} />
      
      {/* Screen-only controls */}
      <div className='print:hidden flex items-center justify-between'>
        <Link
          href={isEmployee ? '/payslips' : `/hr/payroll/${record.year}-${record.month}`}
          className='flex items-center gap-2 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          {isEmployee ? 'Back to My Payslips' : 'Back to Monthly Payroll'}
        </Link>
        <button
          onClick={() => window.print()}
          className='flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/35 bg-primary/8 text-xs font-bold text-primary hover:bg-primary/18 hover:border-primary/60 transition-all'
        >
          <Download className='h-4 w-4' />
          Download / Print
        </button>
      </div>

      {/* Payslip A5 half-page wrapper */}
      <div
        id='payslip'
        className='bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none border border-gray-100 print:w-full print:h-[148mm] print:overflow-hidden print:border-0 print:m-0'
      >
        {/* Header */}
        <div className='bg-gray-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 text-white print:px-4 print:py-3 print:bg-white print:text-black print:border-b-2 print:border-gray-300'>
          <div>
            <p className='text-[9px] font-bold uppercase tracking-[0.25em] text-primary opacity-80 mb-1 print:text-gray-500'>
              STUDIO PAY SLIP
            </p>
            <h1 className='text-lg font-bold tracking-tight'>Wandering Kite Studio</h1>
          </div>
          <div className='sm:text-right'>
            <p className='text-sm font-bold text-white print:text-black'>{payPeriod}</p>
            <p className='text-[10px] text-gray-500 mt-0.5 print:text-gray-600'>
              Status: <span className='font-semibold'>{record.status}</span>
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 text-[10px]'>
          {/* Left Column: Employee & Bank Info */}
          <div className='p-4 border-r border-gray-100 space-y-4 print:p-3'>
            <div>
              <p className='font-bold uppercase tracking-wider text-gray-400 mb-1 text-[9px]'>Employee Details</p>
              <div className='grid grid-cols-[80px_1fr] gap-x-2 gap-y-1'>
                <span className='text-gray-500'>Name:</span>
                <span className='font-bold text-gray-900'>{employee.fullName ?? '—'}</span>
                
                <span className='text-gray-500'>Employee No:</span>
                <span className='font-medium'>{employee.contract?.employeeNumber || '—'}</span>

                <span className='text-gray-500'>Designation:</span>
                <span className='font-medium'>{employee.contract?.jobTitle || '—'}</span>
                
                <span className='text-gray-500'>Department:</span>
                <span className='font-medium'>{employee.contract?.department || '—'}</span>

                <span className='text-gray-500'>Email:</span>
                <span className='font-medium truncate'>{employee.email}</span>
                
                <span className='text-gray-500'>Joining Date:</span>
                <span className='font-medium'>{employee.contract?.joiningDate ? new Date(employee.contract.joiningDate).toLocaleDateString('en-IN') : '—'}</span>
              </div>
            </div>

            <div>
              <p className='font-bold uppercase tracking-wider text-gray-400 mb-1 text-[9px]'>Bank Details</p>
              {employee.contract?.bankAccountNumber ? (
                <div className='grid grid-cols-[80px_1fr] gap-x-2 gap-y-1'>
                  <span className='text-gray-500'>A/C Name:</span>
                  <span className='font-medium'>{employee.contract.bankAccountName || '—'}</span>
                  <span className='text-gray-500'>A/C No:</span>
                  <span className='font-medium'>{employee.contract.bankAccountNumber}</span>
                  <span className='text-gray-500'>IFSC:</span>
                  <span className='font-medium uppercase'>{employee.contract.bankIFSC || '—'}</span>
                </div>
              ) : employee.contract?.upiId ? (
                <div className='grid grid-cols-[80px_1fr] gap-x-2 gap-y-1'>
                  <span className='text-gray-500'>UPI ID:</span>
                  <span className='font-medium'>{employee.contract.upiId}</span>
                </div>
              ) : (
                <p className='text-gray-400 italic'>No bank details configured</p>
              )}
            </div>
            
            <div>
              <p className='font-bold uppercase tracking-wider text-gray-400 mb-1 text-[9px]'>Attendance summary</p>
              <div className='grid grid-cols-[80px_1fr] gap-x-2 gap-y-1'>
                <span className='text-gray-500'>Working Days:</span>
                <span className='font-medium'>{record.workingDays}</span>
                <span className='text-gray-500'>Absent / LOP:</span>
                <span className='font-medium text-red-600'>{record.deductionDays ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Earnings & Deductions */}
          <div className='p-0 flex flex-col'>
            <div className='flex-1'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-50 print:bg-gray-100'>
                    <th className='py-1.5 px-4 text-left text-[9px] font-bold uppercase tracking-wider text-gray-500'>Earnings</th>
                    <th className='py-1.5 px-4 text-right text-[9px] font-bold uppercase tracking-wider text-gray-500'>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <Row label='Basic Salary Earned' value={fmt(record.basePay)} />
                  {(record.incentive ?? 0) > 0 && <Row label='Incentives' value={fmt(record.incentive)} />}
                  {record.overtimeAmount > 0 && <Row label='Overtime' value={fmt(record.overtimeAmount)} />}
                  {record.bonusAmount > 0 && <Row label='Bonus' value={fmt(record.bonusAmount)} />}
                  <Row label='Gross Earnings' value={fmt(grossEarnings)} bold />
                </tbody>
              </table>

              <table className='w-full mt-2'>
                <thead>
                  <tr className='bg-gray-50 print:bg-gray-100'>
                    <th className='py-1.5 px-4 text-left text-[9px] font-bold uppercase tracking-wider text-gray-500'>Deductions</th>
                    <th className='py-1.5 px-4 text-right text-[9px] font-bold uppercase tracking-wider text-gray-500'>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(record.pfAmount ?? 0) > 0 && <Row label='Provident Fund (PF)' value={`− ${fmt(record.pfAmount)}`} />}
                  {(record.ptAmount ?? 0) > 0 && <Row label='Professional Tax (PT)' value={`− ${fmt(record.ptAmount)}`} />}
                  {(record.tdsAmount ?? 0) > 0 && <Row label='Income Tax (TDS)' value={`− ${fmt(record.tdsAmount)}`} />}
                  {record.taxDeduction > 0 && (record.tdsAmount ?? 0) === 0 && <Row label='TDS / Tax Override' value={`− ${fmt(record.taxDeduction)}`} />}
                  {record.latePenalty > 0 && <Row label='Late Penalty' value={`− ${fmt(record.latePenalty)}`} />}
                  {record.otherDeductions > 0 && <Row label='Other Deductions' value={`− ${fmt(record.otherDeductions)}`} />}
                  <Row label='Total Deductions' value={`− ${fmt(totalDeductions)}`} bold />
                </tbody>
              </table>
            </div>

            {/* Net Payout Box */}
            <div className='bg-gray-950 text-white p-4 mt-auto print:bg-gray-200 print:text-black'>
              <div className='flex items-center justify-between'>
                <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400 print:text-gray-600'>
                  Net Salary
                </p>
                <p className='text-lg font-extrabold tracking-tight'>{fmt(record.netPayout)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-4 py-2 bg-gray-50 border-t border-gray-100 text-center text-gray-400 print:border-t-0'>
          <p className='text-[8px]'>
            This is a computer-generated payslip. No physical signature is required.
          </p>
        </div>
      </div>
    </div>
  );
}
