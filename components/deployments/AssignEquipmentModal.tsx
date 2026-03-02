'use client';

import { useState, useTransition, useRef } from 'react';
import { createAssignmentAction } from '@/actions/deployments';
import {
  PlusCircle,
  X,
  User,
  Camera,
  MapPin,
  Calendar,
  Loader2,
  CheckCircle,
} from 'lucide-react';

// ─── Types matching what getAssignmentFormData() returns ────────────────────
interface EmployeeOption {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
}
interface EquipmentOption {
  id: string;
  name: string;
  serialNumber: string;
  categories: { name: string } | null;
}
interface ClientOption {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface AssignEquipmentModalProps {
  employees: EmployeeOption[];
  equipment: EquipmentOption[];
  clients: ClientOption[];
}

// ─── Field component for DRY form fields ────────────────────────────────────
function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <label className='flex items-center gap-1.5 text-xs font-semibold text-foreground/50 uppercase tracking-wider'>
        <Icon className='w-3.5 h-3.5' />
        {label}
      </label>
      {children}
      {error && <p className='text-xs text-red-400 mt-1'>{error}</p>}
    </div>
  );
}

const selectClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 placeholder-foreground/25 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-150 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#1a1a24]';

const inputClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 placeholder-foreground/30 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-150 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed';

// ─── Main Modal ──────────────────────────────────────────────────────────────
export function AssignEquipmentModal({
  employees,
  equipment,
  clients,
}: AssignEquipmentModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  function validate(data: Partial<Record<string, string>>) {
    const errors: Record<string, string> = {};
    if (!data.employeeId) errors.employeeId = 'Select an employee';
    if (!data.equipmentId) errors.equipmentId = 'Select a piece of equipment';
    return errors;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      employeeId: fd.get('employeeId') as string,
      equipmentId: fd.get('equipmentId') as string,
      clientId: (fd.get('clientId') as string) || undefined,
      location: (fd.get('location') as string) || undefined,
      expectedReturn: (fd.get('expectedReturn') as string) || undefined,
      notes: (fd.get('notes') as string) || undefined,
    };

    // Normalise expectedReturn to ISO 8601 datetime
    if (raw.expectedReturn) {
      raw.expectedReturn = new Date(raw.expectedReturn).toISOString();
    }

    const errors = validate(raw);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    startTransition(async () => {
      const res = await createAssignmentAction(raw);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 1400);
      }
    });
  }

  // ── Today's date formatted for the date input min attribute
  const today = new Date().toISOString().slice(0, 16);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => {
          setOpen(true);
          setResult(null);
          setFieldErrors({});
        }}
        className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
          bg-primary text-primary-foreground hover:bg-primary/90
          transition-all duration-150 shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
      >
        <PlusCircle className='w-4 h-4' />
        Assign Equipment
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
          onClick={() => !isPending && setOpen(false)}
        />
      )}

      {/* Modal panel */}
      {open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
          <div
            className='w-full max-w-lg bg-[rgba(17,17,25,0.98)] border border-white/10 rounded-2xl shadow-2xl
              backdrop-blur-xl pointer-events-auto overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-white/8'>
              <div>
                <h2 className='text-base font-semibold text-foreground/90'>
                  Assign Equipment
                </h2>
                <p className='text-xs text-foreground/40 mt-0.5'>
                  Deploy gear to a photographer for a shoot
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className='p-1.5 rounded-lg text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className='p-6 space-y-5'
            >
              {/* ── Row 1: Employee + Equipment ── */}
              <div className='grid grid-cols-2 gap-4'>
                <Field
                  label='Photographer'
                  icon={User}
                  error={fieldErrors.employeeId}
                >
                  <select
                    name='employeeId'
                    className={selectClass}
                    defaultValue=''
                  >
                    <option value='' disabled>
                      Select employee…
                    </option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName ?? e.email}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label='Equipment'
                  icon={Camera}
                  error={fieldErrors.equipmentId}
                >
                  <select
                    name='equipmentId'
                    className={selectClass}
                    defaultValue=''
                  >
                    <option value='' disabled>
                      Select gear…
                    </option>
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.serialNumber})
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* ── Client (optional) ── */}
              <Field label='Client / Project (optional)' icon={MapPin}>
                <select name='clientId' className={selectClass} defaultValue=''>
                  <option value=''>No client — internal move</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `· ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
              </Field>

              {/* ── Location + Expected Return ── */}
              <div className='grid grid-cols-2 gap-4'>
                <Field label='On-site Location' icon={MapPin}>
                  <input
                    name='location'
                    type='text'
                    placeholder='e.g. Bandra Studio, Outdoor'
                    className={inputClass}
                  />
                </Field>

                <Field label='Expected Return' icon={Calendar}>
                  <input
                    name='expectedReturn'
                    type='datetime-local'
                    min={today}
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* ── Notes ── */}
              <Field label='Notes (optional)' icon={Camera}>
                <textarea
                  name='notes'
                  rows={2}
                  placeholder='Handling instructions, job reference…'
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {/* ── Result feedback ── */}
              {result?.error && (
                <div className='px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400'>
                  {result.error}
                </div>
              )}
              {result?.success && (
                <div className='px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2'>
                  <CheckCircle className='w-3.5 h-3.5' />
                  Assignment created — matrix is refreshing…
                </div>
              )}

              {/* ── Equipment availability note ── */}
              {equipment.length === 0 && (
                <div className='px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400'>
                  ⚠ No AVAILABLE equipment found. Mark gear as Available in the
                  Equipment page first.
                </div>
              )}

              {/* ── Footer ── */}
              <div className='flex items-center justify-end gap-3 pt-2 border-t border-white/6'>
                <button
                  type='button'
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className='px-4 py-2 rounded-lg text-sm text-foreground/50 hover:text-foreground/80 hover:bg-white/5 transition-colors disabled:opacity-40'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isPending || equipment.length === 0}
                  className='inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                    bg-primary text-primary-foreground hover:bg-primary/90
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                >
                  {isPending ? (
                    <>
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />{' '}
                      Assigning…
                    </>
                  ) : (
                    <>
                      <PlusCircle className='w-3.5 h-3.5' /> Create Assignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
