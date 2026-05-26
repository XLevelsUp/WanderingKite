'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  approvePayroll,
  markPayrollPaid,
  updatePayrollOverride,
} from '@/actions/hr/payroll';
import {
  CheckCircle,
  CreditCard,
  Loader2,
  Pencil,
  X,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react';
import type { PayrollRecordWithEmployee, PayrollStatus } from '@/lib/types/hr';
import Link from 'next/link';

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_CFG: Record<PayrollStatus, { label: string; cls: string; dot: string }> = {
  DRAFT: {
    label: 'Draft',
    cls: 'bg-white/8 text-foreground/50 border border-white/12',
    dot: 'bg-foreground/30',
  },
  APPROVED: {
    label: 'Approved',
    cls: 'bg-blue-500/12 text-blue-400 border border-blue-500/25',
    dot: 'bg-blue-400',
  },
  PAID: {
    label: 'Paid',
    cls: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
};

// ── Override modal ─────────────────────────────────────────────────────────

function OverrideModal({
  record,
  onClose,
}: {
  record: PayrollRecordWithEmployee;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    overtimeAmount: record.overtimeAmount,
    bonusAmount: record.bonusAmount,
    taxDeduction: record.taxDeduction,
    otherDeductions: record.otherDeductions,
    notes: record.notes ?? '',
  });

  const inputClass =
    'w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await updatePayrollOverride(record.id, {
        overtimeAmount: values.overtimeAmount,
        bonusAmount: values.bonusAmount,
        taxDeduction: values.taxDeduction,
        otherDeductions: values.otherDeductions,
        notes: values.notes,
      });
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative z-10 w-full max-w-sm bg-[rgba(17,17,22,0.98)] border border-primary/18 rounded-2xl shadow-2xl p-6 space-y-5'>
        <div className='flex items-center justify-between'>
          <h3 className='text-base font-bold text-foreground'>Adjust Payroll</h3>
          <button
            onClick={onClose}
            className='text-foreground/40 hover:text-foreground/70 p-1 rounded-lg hover:bg-white/5 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-3'>
          {(
            [
              ['Overtime (₹)', 'overtimeAmount'],
              ['Bonus (₹)', 'bonusAmount'],
              ['Tax Deduction (₹)', 'taxDeduction'],
              ['Other Deductions (₹)', 'otherDeductions'],
            ] as const
          ).map(([label, key]) => (
            <div key={key}>
              <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1'>
                {label}
              </label>
              <input
                type='number'
                min={0}
                step={0.01}
                value={values[key]}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [key]: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>
          ))}
          <div>
            <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1'>
              Notes
            </label>
            <textarea
              value={values.notes}
              onChange={(e) =>
                setValues((v) => ({ ...v, notes: e.target.value }))
              }
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {error && <p className='text-xs text-red-400'>{error}</p>}

        <div className='flex justify-end gap-3 pt-2'>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-xl border border-white/12 text-sm text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className='flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all'
          >
            {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <CheckCircle className='h-4 w-4' />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Card ──────────────────────────────────────────────────────────────

interface PayrollSummaryCardProps {
  record: PayrollRecordWithEmployee;
}

export function PayrollSummaryCard({ record }: PayrollSummaryCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showOverride, setShowOverride] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { employee, status } = record;
  const statusCfg = STATUS_CFG[status];

  function handleApprove() {
    setActionError(null);
    startTransition(async () => {
      const res = await approvePayroll(record.id);
      if (res.error) setActionError(res.error);
      else router.refresh();
    });
  }

  function handlePaid() {
    const ref = window.prompt('Enter payment reference (UPI / bank ref):', '');
    if (ref === null) return; // user cancelled
    setActionError(null);
    startTransition(async () => {
      const res = await markPayrollPaid(record.id, ref || undefined);
      if (res.error) setActionError(res.error);
      else router.refresh();
    });
  }

  const grossEarnings = record.basePay + record.overtimeAmount + record.bonusAmount;
  const totalDeductions =
    record.latePenalty + record.taxDeduction + record.otherDeductions;

  const initials = (employee.fullName ?? employee.email)
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <>
      {showOverride && (
        <OverrideModal
          record={record}
          onClose={() => setShowOverride(false)}
        />
      )}

      <div className='rounded-2xl border border-primary/12 bg-[rgba(17,17,22,0.85)] backdrop-blur-md overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-primary/10'>
          <div className='flex items-center gap-3'>
            {/* Avatar */}
            {employee.contract?.avatarUrl ? (
              <img
                src={employee.contract.avatarUrl}
                alt={employee.fullName ?? ''}
                className='w-10 h-10 rounded-full object-cover ring-1 ring-primary/20'
              />
            ) : (
              <div className='w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary ring-1 ring-primary/20'>
                {initials}
              </div>
            )}
            <div>
              <p className='font-semibold text-foreground text-sm'>
                {employee.fullName ?? employee.email}
              </p>
              <p className='text-xs text-foreground/45'>
                {employee.contract?.jobTitle ?? '—'}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.cls}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>

        {/* Breakdown */}
        <div className='px-5 py-4 space-y-2'>
          {/* Attendance summary */}
          <div className='flex items-center justify-between text-xs'>
            <span className='text-foreground/45'>
              Attendance
            </span>
            <span className='font-medium text-foreground/70'>
              {record.presentDays} / {record.workingDays} days
              {record.lateDays > 0 && (
                <span className='text-amber-400 ml-2'>({record.lateDays} late)</span>
              )}
            </span>
          </div>

          <div className='my-2 border-t border-primary/8' />

          {/* Earnings */}
          <div className='flex items-start gap-2'>
            <TrendingUp className='w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0' />
            <div className='flex-1 space-y-1 text-xs'>
              <LineItem label='Base Pay' value={record.basePay} />
              {record.overtimeAmount > 0 && (
                <LineItem label='Overtime' value={record.overtimeAmount} />
              )}
              {record.bonusAmount > 0 && (
                <LineItem label='Bonus' value={record.bonusAmount} />
              )}
              <div className='flex justify-between font-semibold text-foreground/80 pt-0.5 border-t border-primary/8'>
                <span>Gross Earnings</span>
                <span>{fmt(grossEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          {totalDeductions > 0 && (
            <div className='flex items-start gap-2'>
              <TrendingDown className='w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0' />
              <div className='flex-1 space-y-1 text-xs'>
                {record.latePenalty > 0 && (
                  <LineItem label='Late Penalty' value={-record.latePenalty} negative />
                )}
                {record.unpaidLeaves > 0 && (
                  <LineItem label='Unpaid Leaves' value={-record.unpaidLeaves} negative />
                )}
                {record.taxDeduction > 0 && (
                  <LineItem label='TDS' value={-record.taxDeduction} negative />
                )}
                {record.otherDeductions > 0 && (
                  <LineItem label='Other Deductions' value={-record.otherDeductions} negative />
                )}
              </div>
            </div>
          )}

          <div className='my-2 border-t border-primary/8' />

          {/* Net Payout */}
          <div className='flex items-center justify-between'>
            <span className='text-sm font-bold text-foreground'>Net Payout</span>
            <span className='text-lg font-bold text-primary tabular-nums'>
              {fmt(record.netPayout)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className='px-5 py-4 border-t border-primary/10 flex flex-wrap items-center gap-2'>
          {/* Payslip link */}
          <Link
            href={`/admin/payroll/payslip/${record.id}`}
            className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/12 text-xs font-medium text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all'
          >
            <FileText className='h-3.5 w-3.5' />
            Payslip
          </Link>

          {status === 'DRAFT' && (
            <>
              <button
                onClick={() => setShowOverride(true)}
                className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 text-xs font-medium text-primary/70 hover:text-primary hover:bg-primary/8 transition-all'
              >
                <Pencil className='h-3.5 w-3.5' />
                Adjust
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-semibold text-blue-300 hover:bg-blue-500/25 disabled:opacity-50 transition-all'
              >
                {isPending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <CheckCircle className='h-3.5 w-3.5' />}
                Approve
              </button>
            </>
          )}

          {status === 'APPROVED' && (
            <button
              onClick={handlePaid}
              disabled={isPending}
              className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 transition-all'
            >
              {isPending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <CreditCard className='h-3.5 w-3.5' />}
              Mark Paid
            </button>
          )}

          {actionError && (
            <p className='text-xs text-red-400 w-full mt-1'>{actionError}</p>
          )}
        </div>
      </div>
    </>
  );
}

function LineItem({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className='flex justify-between'>
      <span className='text-foreground/50'>{label}</span>
      <span className={negative ? 'text-red-400' : 'text-foreground/70'}>
        {negative ? `−${fmt(Math.abs(value))}` : fmt(value)}
      </span>
    </div>
  );
}
