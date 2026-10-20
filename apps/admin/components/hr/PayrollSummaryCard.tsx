'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  approvePayroll,
  markPayrollPaid,
  updatePayrollOverride,
  rejectPayroll,
  deletePayrollRecord,
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
  Calendar,
  Clock,
  Shield,
  Trash2,
  ChevronDown,
  ChevronUp,
  Percent,
} from 'lucide-react';
import type { PayrollRecordWithEmployee, PayrollStatus } from '@/lib/types/hr';
import Link from 'next/link';
import { useNotifications } from '@/components/ui/useNotifications';

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
  REJECTED: {
    label: 'Rejected',
    cls: 'bg-red-500/12 text-red-400 border border-red-500/25',
    dot: 'bg-red-400',
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
    incentiveAmount: record.incentive ?? 0,
    overtimeHours: record.overtimeHours ?? 0,
    bonusAmount: record.bonusAmount,
    taxDeduction: record.taxDeduction,
    otherDeductions: record.otherDeductions,
    notes: record.notes ?? '',
  });

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder-foreground/20';

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await updatePayrollOverride(record.id, {
        bonusAmount: values.bonusAmount,
        taxDeduction: values.taxDeduction,
        otherDeductions: values.otherDeductions,
        incentive: values.incentiveAmount,
        overtimeHours: values.overtimeHours,
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

  // Derived calculations for preview
  const safeDays = record.workingDays > 0 ? record.workingDays : 1;
  const perDaySalary = record.baseSalary / safeDays;
  const totalWorkingHours = safeDays * 8;
  const hourlyRate = record.baseSalary / totalWorkingHours;
  const previewIncentive = values.incentiveAmount;
  const previewOvertime = values.overtimeHours * hourlyRate;
  const previewGross = (record.baseSalary - (record.deductionsTotal ?? 0)) + previewIncentive + previewOvertime + values.bonusAmount;
  const previewNet = Math.max(0, previewGross - (record.latePenalty ?? 0) - values.taxDeduction - values.otherDeductions);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
      <div
        className='absolute inset-0 bg-black/80 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative z-10 w-full max-w-lg bg-[rgba(17,17,22,0.98)] border border-primary/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='px-6 py-5 border-b border-primary/12 flex items-start justify-between flex-shrink-0'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-0.5'>
              Adjustment Form
            </p>
            <h3 className='text-base font-bold text-foreground'>
              Adjust Payroll Details — {record.employee.fullName ?? record.employee.email}
            </h3>
          </div>
          <button
            onClick={onClose}
            data-no-track
            className='text-foreground/40 hover:text-foreground/70 p-1.5 rounded-lg hover:bg-white/5 transition-colors mt-0.5'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Scrollable inputs */}
        <div className='flex-1 overflow-y-auto p-6 space-y-5'>
          {/* Working stats read-only banner */}
          <div className='grid grid-cols-3 gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center text-[10px] text-foreground/45'>
            <div>
              <span className='block font-semibold text-foreground/80 text-xs'>{safeDays}</span>
              Working Days
            </div>
            <div>
              <span className='block font-semibold text-foreground/80 text-xs'>{fmt(perDaySalary)}</span>
              Salary / Day
            </div>
            <div>
              <span className='block font-semibold text-foreground/80 text-xs'>{fmt(hourlyRate)}/hr</span>
              Hourly Rate (8h)
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Compensation logs */}
            <div>
              <label className='block text-[10px] font-semibold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1'>
                Incentive Amount (₹)
              </label>
              <input
                type='number'
                min={0}
                step={100}
                value={values.incentiveAmount}
                onFocus={() => {
                  if (values.incentiveAmount === 0) {
                    setValues((v) => ({ ...v, incentiveAmount: '' as any }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                    setValues((v) => ({ ...v, incentiveAmount: 0 }));
                  }
                }}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    incentiveAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
                placeholder='Enter flat incentive'
              />
            </div>

            <div>
              <label className='block text-[10px] font-semibold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1'>
                <Clock className='w-3 h-3 text-primary/70' />
                Overtime Hours
              </label>
              <input
                type='number'
                min={0}
                step={0.5}
                value={values.overtimeHours}
                onFocus={() => {
                  if (values.overtimeHours === 0) {
                    setValues((v) => ({ ...v, overtimeHours: '' as any }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                    setValues((v) => ({ ...v, overtimeHours: 0 }));
                  }
                }}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    overtimeHours: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
                placeholder='Enter hours logged'
              />
              <span className='text-[10px] text-foreground/40 mt-1 block'>
                Calculated Payout: {fmt(previewOvertime)}
              </span>
            </div>

            <div>
              <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
                Bonus Amount (₹)
              </label>
              <input
                type='number'
                min={0}
                step={100}
                value={values.bonusAmount}
                onFocus={() => {
                  if (values.bonusAmount === 0) {
                    setValues((v) => ({ ...v, bonusAmount: '' as any }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                    setValues((v) => ({ ...v, bonusAmount: 0 }));
                  }
                }}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    bonusAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
                TDS Tax Deduction (₹)
              </label>
              <input
                type='number'
                min={0}
                step={100}
                value={values.taxDeduction}
                onFocus={() => {
                  if (values.taxDeduction === 0) {
                    setValues((v) => ({ ...v, taxDeduction: '' as any }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                    setValues((v) => ({ ...v, taxDeduction: 0 }));
                  }
                }}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    taxDeduction: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>

            <div className='sm:col-span-2'>
              <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
                Other Deductions (₹)
              </label>
              <input
                type='number'
                min={0}
                step={100}
                value={values.otherDeductions}
                onFocus={() => {
                  if (values.otherDeductions === 0) {
                    setValues((v) => ({ ...v, otherDeductions: '' as any }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                    setValues((v) => ({ ...v, otherDeductions: 0 }));
                  }
                }}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    otherDeductions: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>

            <div className='sm:col-span-2'>
              <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
                Adjustment Notes
              </label>
              <textarea
                value={values.notes}
                onChange={(e) =>
                  setValues((v) => ({ ...v, notes: e.target.value }))
                }
                rows={2}
                placeholder='Reason for compensation hours or deduction overrides...'
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Real-time breakdown preview */}
          <div className='bg-primary/[0.02] border border-primary/10 rounded-xl p-4 space-y-2 text-xs'>
            <div className='flex justify-between text-foreground/50'>
              <span>Gross (Salary + Overtime + Incentive + Bonus)</span>
              <span className='font-medium text-foreground/80'>{fmt(previewGross)}</span>
            </div>
            <div className='flex justify-between text-red-400/70'>
              <span>Total Deductions (Leaves, Late, Tax & Others)</span>
              <span>− {fmt((record.latePenalty ?? 0) + (record.deductionsTotal ?? 0) + values.taxDeduction + values.otherDeductions)}</span>
            </div>
            <div className='flex justify-between font-bold text-sm text-primary pt-1 border-t border-primary/10'>
              <span>Estimated Net Payout</span>
              <span>{fmt(previewNet)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-primary/12 flex-shrink-0 bg-white/[0.01]'>
          {error && <p className='text-xs text-red-400 mb-3'>{error}</p>}

          <div className='flex justify-end gap-3'>
            <button
              onClick={onClose}
              data-no-track
              className='px-4 py-2.5 rounded-xl border border-white/12 text-xs font-semibold text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(255,255,255,0.02)]'
            >
              {isPending ? (
                <>
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle className='h-3.5 w-3.5' />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Card ──────────────────────────────────────────────────────────────

interface PayrollSummaryCardProps {
  record: PayrollRecordWithEmployee;
  isSuperAdmin?: boolean;
}

export function PayrollSummaryCard({ record, isSuperAdmin = false }: PayrollSummaryCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showOverride, setShowOverride] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { showModal, removeModal } = useNotifications();

  const { employee, status } = record;
  const statusCfg = STATUS_CFG[status] ?? STATUS_CFG.DRAFT;

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
    if (ref === null) return;
    setActionError(null);
    startTransition(async () => {
      const res = await markPayrollPaid(record.id, ref || undefined);
      if (res.error) setActionError(res.error);
      else router.refresh();
    });
  }

  function handleReject() {
    const modalId = showModal({
      title: 'Reject Payroll',
      description: 'Are you sure you want to reject this payroll record?',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      onCancel: () => removeModal(modalId),
      onConfirm: () => {
        setActionError(null);
        startTransition(async () => {
          const res = await rejectPayroll(record.id);
          if (res.error) setActionError(res.error);
          else router.refresh();
        });
      }
    });
  }

  function handleDelete() {
    const modalId = showModal({
      title: 'Delete Payroll',
      description: 'Are you sure you want to delete this payroll record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onCancel: () => removeModal(modalId),
      onConfirm: () => {
        setActionError(null);
        startTransition(async () => {
          const res = await deletePayrollRecord(record.id);
          if (res.error) setActionError(res.error);
          else router.refresh();
        });
      }
    });
  }

  // Compensation Math derived safely
  const grossEarnings = record.basePay + record.overtimeAmount + record.bonusAmount + (record.incentive ?? 0);
  const totalDeductions =
    record.latePenalty + (record.deductionsTotal ?? record.unpaidLeaves ?? 0) + record.taxDeduction + record.otherDeductions;

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

      <div className='rounded-2xl border border-primary/12 bg-[rgba(17,17,22,0.85)] hover:border-primary/20 backdrop-blur-md overflow-hidden transition-all duration-200 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-primary/10 bg-white/[0.01]'>
          <div className='flex items-center gap-3 min-w-0'>
            {employee.contract?.avatarUrl ? (
              <img
                src={employee.contract.avatarUrl}
                alt={employee.fullName ?? ''}
                className='w-10 h-10 rounded-full object-cover ring-1 ring-primary/20 flex-shrink-0'
              />
            ) : (
              <div className='w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary ring-1 ring-primary/20 flex-shrink-0'>
                {initials}
              </div>
            )}
            <div className='min-w-0'>
              <p className='font-semibold text-foreground text-sm truncate leading-tight'>
                {employee.fullName ?? employee.email}
              </p>
              <p className='text-[10px] text-foreground/45 truncate mt-0.5'>
                {employee.contract?.jobTitle ?? 'Staff'}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusCfg.cls}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>

        {/* Short Breakdown */}
        <div className='px-5 py-4 space-y-3.5 flex-1'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-foreground/45'>Present Summary</span>
            <span className='font-medium text-foreground/80 tabular-nums'>
              {record.presentDays} / {record.workingDays} days
              {record.lateDays > 0 && (
                <span className='text-amber-400 ml-1.5'>({record.lateDays}L)</span>
              )}
            </span>
          </div>

          <div className='grid grid-cols-2 gap-4 text-xs bg-white/[0.015] border border-white/5 rounded-xl p-3'>
            <div>
              <span className='text-foreground/35 block text-[10px] uppercase tracking-wider mb-0.5'>Gross Payout</span>
              <span className='font-semibold text-foreground/80'>{fmt(grossEarnings)}</span>
            </div>
            <div>
              <span className='text-foreground/35 block text-[10px] uppercase tracking-wider mb-0.5'>Deductions</span>
              <span className='font-semibold text-red-400'>{totalDeductions > 0 ? `− ${fmt(totalDeductions)}` : '₹0.00'}</span>
            </div>
          </div>

          {/* Expandable detailed 16-item columns breakdown */}
          <button
            type='button'
            onClick={() => setExpanded(!expanded)}
            data-no-track
            className='w-full flex items-center justify-between text-[11px] text-primary/75 hover:text-primary transition-colors bg-primary/4 hover:bg-primary/8 border border-primary/10 rounded-xl px-3 py-2 font-semibold'
          >
            <span className='flex items-center gap-1.5'>
              <FileText className='w-3.5 h-3.5' />
              {expanded ? 'Hide Detailed Breakdown' : 'Show Detailed Breakdown (16 Columns)'}
            </span>
            {expanded ? <ChevronUp className='w-3.5 h-3.5' /> : <ChevronDown className='w-3.5 h-3.5' />}
          </button>

          {expanded && (
            <div className='border-t border-primary/8 pt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-foreground/50 bg-black/20 rounded-xl p-3 border border-white/5 animate-in slide-in-from-top-2 duration-150'>
              <DetailedItem label='Working Days' value={`${record.workingDays} days`} />
              <DetailedItem label='Present Days' value={`${record.presentDays} days`} />
              <DetailedItem label='Absent Days' value={`${record.absentDays ?? 0} days`} />
              <DetailedItem label='Leave Days' value={`${record.leaveDays ?? 0} days`} />
              <DetailedItem label='Paid Leaves Used' value={`${record.paidLeavesUsed ?? 0} days`} />
              <DetailedItem label='Half Days' value={`${record.halfDays ?? 0} days`} />
              <DetailedItem label='Late Days' value={`${record.lateDays} days`} />
              <DetailedItem label='On-Aid Leave Days' value={`${record.onAidLeaveDays ?? 0} days`} />
              <DetailedItem label='Deduction Days' value={`${record.deductionDays ?? 0} days`} />
              <DetailedItem label='Per-Day Salary' value={fmt(record.perDaySalary ?? (record.baseSalary / (record.workingDays || 30)))} />
              <DetailedItem label='Deductions Total' value={fmt(record.deductionsTotal ?? record.unpaidLeaves ?? 0)} highlightRed />
              <DetailedItem label='Incentive Amount' value={fmt(record.incentive ?? 0)} highlightGreen />
              <DetailedItem label='Overtime Hours' value={`${record.overtimeHours ?? 0} hrs`} />
              <DetailedItem label='Overtime Amount' value={fmt(record.overtimeAmount ?? 0)} highlightGreen />
              <DetailedItem label='Final Net Salary' value={fmt(record.netPayout)} highlightPrimary />
            </div>
          )}

          <div className='border-t border-primary/8 pt-2 flex items-center justify-between'>
            <span className='text-xs font-bold text-foreground'>Net Salary</span>
            <span className='text-base font-bold text-primary tracking-tight tabular-nums'>
              {fmt(record.netPayout)}
            </span>
          </div>
        </div>

        {/* Actions panel */}
        <div className='px-5 py-4 border-t border-primary/10 bg-white/[0.01] flex flex-wrap items-center gap-2 mt-auto'>
          <Link
            href={`/hr/payroll/payslip/${record.id}`}
            className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-[10px] font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all'
          >
            <FileText className='h-3.5 w-3.5' />
            Payslip
          </Link>

          {status === 'DRAFT' && (
            <>
              <button
                onClick={() => setShowOverride(true)}
                className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 text-[10px] font-semibold text-primary/80 hover:text-primary hover:bg-primary/8 transition-all'
              >
                <Pencil className='h-3.5 w-3.5' />
                Adjust
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/25 text-[10px] font-bold text-blue-300 hover:bg-blue-500/20 disabled:opacity-50 transition-all'
              >
                {isPending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <CheckCircle className='h-3.5 w-3.5' />}
                Approve
              </button>
              {isSuperAdmin && (
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-[10px] font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition-all ml-auto'
                  title="Delete generated payroll record"
                >
                  {isPending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-3.5 w-3.5' />}
                  Delete
                </button>
              )}
            </>
          )}

          {status === 'APPROVED' && (
            <button
              onClick={handlePaid}
              disabled={isPending}
              className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 transition-all'
            >
              {isPending ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <CreditCard className='h-3.5 w-3.5' />}
              Mark Paid
            </button>
          )}

          {actionError && (
            <p className='text-[10px] text-red-400 w-full mt-1.5'>{actionError}</p>
          )}
        </div>
      </div>
    </>
  );
}

function DetailedItem({
  label,
  value,
  highlightGreen,
  highlightRed,
  highlightPrimary,
}: {
  label: string;
  value: string;
  highlightGreen?: boolean;
  highlightRed?: boolean;
  highlightPrimary?: boolean;
}) {
  return (
    <div className='flex justify-between py-0.5 border-b border-white/[0.03] last:border-0'>
      <span className='text-foreground/35'>{label}</span>
      <span
        className={`font-medium tabular-nums ${
          highlightGreen
            ? 'text-emerald-400'
            : highlightRed
              ? 'text-red-400'
              : highlightPrimary
                ? 'text-primary'
                : 'text-foreground/75'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
